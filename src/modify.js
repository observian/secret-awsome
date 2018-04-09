import {
	updateParameter,
	types
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";
let jquery = require('jquery');
let qs = require('query-string');

function saveForm() {
	let data = qs.parse(jquery(this).serialize());

	return false;
}


ipcRenderer.on('open-message', (event, arg) => {
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
