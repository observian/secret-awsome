import {
	updateParameters,
	defaultRegions
} from '../api/ssm';
import {
	ipcRenderer
} from 'electron';
import Promise from 'bluebird';
import jquery from 'jquery';
import {
	parse
} from 'query-string';

let loader = document.getElementById('load');
loader.load = function () {
	this.style.visibility = 'visible';
	jquery('#region-form>button').prop('disabled', true);
};

loader.stop = function () {
	this.style.visibility = 'hidden';
	jquery('#region-form>button').prop('disabled', false);
};

function saveForm() {
	loader.load();
	let data = parse(jquery(this).serialize());

	if (!jquery.isArray(data.region)) {
		data.region = [data.region];
	}

	updateParameters(data.name, data.type, data.value, data.region)
		.then(result => {
			ipcRenderer.send('reload-index', JSON.stringify(result));
		})
		.catch(err => {
			console.error(err, err.stack);
		});

	return false;
}

let regionForm = jquery('#region-form');
regionForm.submit(saveForm);

function setValues(obj) {
	let prom;

	prom = Promise.try(() => {
		regionForm[0].reset();

		let fs = jquery('#region-fieldset').empty();
		fs.append('<legend>Regions</legend>');

		for (let i = 0; i < defaultRegions.regions.length; i++) {
			const reg = defaultRegions.regions[i];

			fs.append(`<div>
		<input type="checkbox" id="${reg.region}" name="region" value="${reg.region}">
		<label for="${reg.region}">${reg.displayname} (${reg.region})</label>
	</div>`);
		}


		jquery('#name').prop('readonly', false);
		jquery('#parameter-type-region option').prop('disabled', false).prop('selected', false);

		if (obj) {
			jquery('#name').val(obj.data.Name);
			jquery('#name').prop('readonly', true);
			jquery(`#parameter-type-region option[value="${obj.data.Type}"]`).prop('selected', true);
			jquery('#parameter-type-region option:not(:selected)').prop('disabled', true);

			jquery('#value').val(obj.data.Value);

			for (let i = 0; i < obj.selectedRegions.length; i++) {
				jquery(`#${obj.selectedRegions[i]}`).prop('checked', true).click(function () {
					this.checked = !this.checked;
				});
			}
		}

		return true;

	});

	return prom;
}

ipcRenderer.on('open-message', (event, arg) => {
	loader.load();

	let obj = JSON.parse(arg);

	setValues(obj)
		.finally(() => {
			loader.stop();
		});

});
