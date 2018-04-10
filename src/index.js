import {
	updateParameter,
	getParameters,
	getParameter
} from "./api/ssm";
import {
	ipcRenderer
} from "electron";
let jquery = require('jquery');

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
	loader.load();
	let dataset = ev.currentTarget.dataset;

	getParameter(dataset.name, dataset.region, true)
		.then(results => {
			let target = document.querySelector(`[data-region='${results.Region}'][data-name='${results.Parameter.Name}'][data-type='${results.Parameter.Type}']`);

			target.innerHTML = `<input value='${results.Parameter.Value}'><span class="clickable"><i class="far fa-save"></i></span><span class="clickable"><i class="fas fa-ban"></i></span>`;
			target.removeEventListener('click', valueClickListener);
			target.childNodes[0].select();
			target.childNodes[1].addEventListener('click', valueSaveClickListener);
			target.childNodes[2].addEventListener('click', valueCancelClickListener);
		})
		.catch(err => {
			console.log(err, err.stack);
		})
		.finally(() => {
			loader.stop();
		});
}

function cloneClickListener(ev) {
	ipcRenderer.send('modify', JSON.stringify(ev.data));
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
		let nameItem = createAndAppendListItem(paramUl, `${item.Name}`);
		let it = jquery(nameItem);
		let cl = jquery('<span class="clickable"><i class="far fa-clone"></i></span>').click(item, cloneClickListener);

		it.prepend(cl);

		let infoUl = document.createElement('ul');
		createAndAppendListItem(infoUl, `${item.Type}`);
		let dataValue = item.Type !== 'SecureString' ? item.Value : '';
		let valueItem = createAndAppendListItem(infoUl, `${dataValue || '******'}`);
		valueItem.setAttribute('data-region', param.Region);
		valueItem.setAttribute('data-name', item.Name);
		valueItem.setAttribute('data-type', item.Type);
		valueItem.setAttribute('data-value', dataValue);
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
	return getParameters()
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
