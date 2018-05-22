import {
	updateParameters,
	defaultRegions
} from '../api/ssm';

import {
	ipcRenderer,
	remote
} from 'electron';

const {
	dialog
} = remote;

import Promise from 'bluebird';

import jquery from 'jquery';

import {
	timeline
} from '../assets/lib/loader';

import {
	parse
} from 'query-string';

let loader = document.querySelector('.loader-icon');

function load() {
	loader.style.visibility = 'visible';
	timeline.restart();
	jquery('.interact').prop('disabled', true);
}

function stop() {
	loader.style.visibility = 'hidden';
	timeline.stop();
	jquery('.interact').prop('disabled', false);
}

function saveForm() {
	load();
	let data = parse(jquery(this).serialize());

	if (!jquery.isArray(data.region)) {
		data.region = [data.region];
	}

	updateParameters(data.name, data.type, data.value, data.region)
		.then(result => {
			document.getElementById('save-parameters').blur();
			ipcRenderer.send('modify-done');
			ipcRenderer.send('reload-index', JSON.stringify(result));
		})
		.catch(err => {
			dialog.showErrorBox('Save Failed', 'Please make sure your credentials are correct and you have an internet connection. Credentials can be updated via Manage Profiles in the Window menu.');
			console.error(err, err.stack);
		})
		.finally(() => {
			stop();
		});

	return false;
}

let regionForm = jquery('#region-form');
regionForm.submit(saveForm);

const cancelBtn = document.getElementById('cancel-modify');

cancelBtn.addEventListener('click', () => {
	ipcRenderer.send('modify-done');
	cancelBtn.blur();
});

function setValues(obj) {
	let prom;

	prom = Promise.try(() => {
		regionForm[0].reset();

		let fs = jquery('.checkboxes').empty();

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
	load();

	let obj = JSON.parse(arg);

	setValues(obj)
		.finally(() => {
			stop();
		});
});
