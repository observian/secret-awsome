import {
	updateParameter,
	updateParameters,
	types,
	defaultRegions
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";
let jquery = require('jquery');
let qs = require('query-string');

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
	let data = qs.parse(jquery(this).serialize());

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

ipcRenderer.on('open-message', (event, arg) => {
	loader.stop();

	let fs = jquery('#region-fieldset').empty();



	for (let i = 0; i < defaultRegions.regions.length; i++) {
		const reg = defaultRegions.regions[i];
		fs.append(`<div>
		<input type="checkbox" id="${reg.region}" name="region" value="${reg.region}">
		<label for="${reg.region}">${reg.displayname} (${reg.region})</label>
	</div>`);
	}
	let f = jquery('#region-form');
	f[0].reset();
	f.submit(saveForm);
	// let form = document.getElementById('region-form');

	// if (form.attachEvent) {
	// 	form.attachEvent("submit", saveForm);
	// } else {
	// 	form.addEventListener("submit", saveForm);
	// }
	// document.getElementById('name').innerText = currentItem.name;
	// document.getElementById('type').innerText = currentItem.type;
	// document.getElementById('value').value = currentItem.value;
});

// document.getElementById('save').addEventListener('click', () => {
// 	currentItem.value = document.getElementById('value').value;
// 	updateParameter(currentItem.name, currentItem.type, currentItem.value, currentItem.region)
// 		.then(result => {
// 			ipcRenderer.send('modify-save-complete', JSON.stringify(result));
// 			console.log(JSON.stringify(result));

// 		})
// 		.catch(err => {
// 			console.error(err, err.stack);
// 		});

// });
