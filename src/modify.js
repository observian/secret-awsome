import {
	updateParameter
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";

let currentItem;

ipcRenderer.on('open-message', (event, arg) => {
	console.log(arg); // prints "pong"

	currentItem = JSON.parse(arg);
	document.getElementById('region').innerText = currentItem.region;
	document.getElementById('name').innerText = currentItem.name;
	document.getElementById('type').innerText = currentItem.type;
	document.getElementById('value').value = currentItem.value;
});

document.getElementById('save').addEventListener('click', () => {
	currentItem.value = document.getElementById('value').value;
	updateParameter(currentItem.name, currentItem.type, currentItem.value, currentItem.region)
		.then(result => {
			ipcRenderer.send('modify-save-complete', JSON.stringify(result));
			console.log(JSON.stringify(result));

		})
		.catch(err => {
			console.error(err, err.stack);
		});

});
