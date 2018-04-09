import {
	updateParameter,
	getAllParameters
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";

let allParams = [];

let loader = document.getElementById('load');
loader.load = function () {
	this.style.visibility = 'visible';
	document.getElementById('main').setAttribute("disabled", "true");
};

loader.stop = function () {
	this.style.visibility = 'hidden';
	document.getElementById('main').setAttribute("disabled", "false");
};

ipcRenderer.on('reload', (event, arg) => {
	getAll()
		.then(() => {
			ipcRenderer.send('index-refresh-complete', arg);
		});
});

const getAllParamsBtn = document.getElementById('get-all-parameters');
const addBtn = document.getElementById('add');

function valueCancelClickListener() {
	getAll();
}

function valueSaveClickListener(ev) {
	loader.load();
	ev.currentTarget.removeEventListener('click', valueSaveClickListener);
	let dataset = ev.currentTarget.parentNode.dataset;
	let value = ev.currentTarget.parentNode.childNodes[0].value;

	updateParameter(dataset.name, dataset.type, value, dataset.region)
		.then(() => {
			getAll();
		})
		.catch(err => {
			console.error(err, err.stack);
		});

}

function valueClickListener(ev) {
	//ipcRenderer.send('modify', JSON.stringify(ev.currentTarget.dataset));
	ev.currentTarget.innerHTML = `<input value='${ev.currentTarget.dataset.value}'><span class="clickable"><i class="far fa-save"></i></span><span class="clickable"><i class="fas fa-ban"></i></span>`;
	ev.currentTarget.removeEventListener('click', valueClickListener);
	ev.currentTarget.childNodes[0].select();
	ev.currentTarget.childNodes[1].addEventListener('click', valueSaveClickListener);
	ev.currentTarget.childNodes[2].addEventListener('click', valueCancelClickListener);

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
	loader.load();
	return getAllParameters()
		.then(params => {
			allParams = params;
			setParamList(allParams);
		})
		.catch(err => {
			console.error(err, err.stack);
		})
		.finally(() => {
			loader.stop();
		});
}

getAllParamsBtn.addEventListener('click', () => {
	getAll();
});

addBtn.addEventListener('click', () => {
	ipcRenderer.send('modify');
});

getAll();
