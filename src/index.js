import {
	getAllParameters
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";


let allParams = [];

ipcRenderer.on('reload', (event, arg) => {
	getAll()
		.then(() => {
			ipcRenderer.send('index-refresh-complete', arg);
		});
});


const getAllParamsBtn = document.getElementById('get-all-parameters');

function valueClickListener(ev) {
	ipcRenderer.send('modify', JSON.stringify(ev.currentTarget.dataset));


	console.log(JSON.stringify(ev.currentTarget.dataset));
}

function createAndAppendListItem(list, innerText) {
	let li = document.createElement('li');
	li.innerText = innerText;
	list.appendChild(li);

	return li;
}

function createListObj(param) {
	let innerUl = document.createElement('ul');
	createAndAppendListItem(innerUl, `${param.Region}`);

	if (!param.Parameters || param.Parameters.length === 0) {
		return innerUl;
	}

	for (let i = 0; i < param.Parameters.length; i++) {
		let paramUl = document.createElement('ul');
		const item = param.Parameters[i];
		createAndAppendListItem(paramUl, `${item.Name}`);

		let infoUl = document.createElement('ul');
		createAndAppendListItem(infoUl, `${item.Type}`);
		let valueItem = createAndAppendListItem(infoUl, `${item.Value}`);
		valueItem.setAttribute('data-region', param.Region);
		valueItem.setAttribute('data-name', item.Name);
		valueItem.setAttribute('data-type', item.Type);
		valueItem.setAttribute('data-value', item.Value);
		valueItem.addEventListener('click', valueClickListener);

		paramUl.appendChild(infoUl);
		innerUl.appendChild(paramUl);
	}

	return innerUl;
}

function setParamList(params) {
	let ul = document.getElementById("all-param-list");

	for (let i = 0; i < ul.childNodes.length; i++) {
		const node = ul.childNodes[i];

		let cNode = node.cloneNode(false);
		node.parentNode.replaceChild(cNode, node);
	}

	ul.innerHTML = '';

	for (let i = 0; i < params.length; i++) {
		const param = params[i];
		let node = createListObj(param);
		ul.appendChild(node);
	}
}

function getAll() {
	return getAllParameters()
		.then(params => {
			allParams = params;
			setParamList(allParams);
		})
		.catch(err => {
			console.error(err, err.stack);
		});
}

getAllParamsBtn.addEventListener('click', () => {
	getAll();
});

getAll();
