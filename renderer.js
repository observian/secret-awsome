let ssm = require(`${process.cwd()}/src/api/ssm`);
let allParams = [];

const getAllParamsBtn = document.getElementById('get-all-parameters');

function createAndAppendListItem(list, innerText) {
	let li = document.createElement('li');
	li.innerText = innerText;
	list.appendChild(li);
}

function createListObj(param) {
	let innerUl = document.createElement('ul');
	createAndAppendListItem(innerUl, `${param.Region}`);

	if (!param.Parameters || param.Parameters.length === 0) {
		return innerUl;
	}

	let paramSectionUl = document.createElement('ul');
	createAndAppendListItem(paramSectionUl, `Parameters`);

	for (let i = 0; i < param.Parameters.length; i++) {
		let paramUl = document.createElement('ul');
		const item = param.Parameters[i];
		createAndAppendListItem(paramUl, `${item.Name}`);

		let infoUl = document.createElement('ul');
		createAndAppendListItem(infoUl, `${item.Type}`);
		createAndAppendListItem(infoUl, `${item.Value}`);

		paramUl.appendChild(infoUl);
		paramSectionUl.appendChild(paramUl);
	}

	innerUl.appendChild(paramSectionUl);

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

getAllParamsBtn.addEventListener('click', () => {
	ssm.getAllParameters()
		.then(params => {
			allParams = params;
			setParamList(allParams);
		})
		.catch(err => {
			console.error(err, err.stack);
		});

});
