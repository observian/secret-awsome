import {
	updateParameter,
	updateParameters,
	getParameters,
	types,
	defaultRegions,
	getRegions
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";
import Promise from "bluebird";
import jquery from "jquery";
import {
	parse
} from "query-string";

let loader = document.getElementById('load');
loader.load = function () {
	this.style.visibility = 'visible';
	document.getElementById('region-form').setAttribute("disabled", "true");
};

loader.stop = function () {
	this.style.visibility = 'hidden';
	document.getElementById('region-form').setAttribute("disabled", "false");
};

function saveForm() {
	loader.load();
	let data = parse(jquery(this).serialize());

	updateParameters(data.name, data.type, data.value, data.region)
		.then(result => {
			ipcRenderer.send('modify-save-complete', JSON.stringify(result));
			console.log(JSON.stringify(result));

		})
		.catch(err => {
			console.error(err, err.stack);
		})
		.finally(() => {
			loader.stop();
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

		jquery('#name').prop('readonly', false);
		jquery('#parameter-type-region option').prop('disabled', false).prop('selected', false);

		if (obj) {
			jquery('#name').val(obj.Name);
			jquery('#name').prop('readonly', true);
			jquery(`#parameter-type-region option[value="${obj.Type}"]`).prop('selected', true);
			jquery('#parameter-type-region option:not(:selected)').prop('disabled', true);
			jquery('#value').val(obj.Value);

			return getRegions(obj.Name)
				.then((results) => {
					for (let i = 0; i < defaultRegions.regions.length; i++) {
						const reg = defaultRegions.regions[i];

						let isChecked = results.find((item) => {
							return item === reg.region;
						});

						fs.append(`<div>
						<input type="checkbox" id="${reg.region}" name="region" value="${reg.region}" ${isChecked ? 'checked onclick="this.checked=!this.checked;"' : ''}>
						<label for="${reg.region}">${reg.displayname} (${reg.region})</label>
					</div>`);
					}
				});
		}

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
