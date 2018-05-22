import {
	updateParameter,
	getParameters,
	deleteParameters,
	setCredentials
} from '../api/ssm';

import {
	getProfiles
} from '../api/profile';

import {
	ipcRenderer,
	shell
} from 'electron';

import jquery from 'jquery';

import {
	Grid
} from 'ag-grid';

import {
	remote
} from 'electron';

import {
	timeline
} from '../assets/lib/loader';

const {
	dialog
} = remote;

window.eval = global.eval = function () {
	throw new Error('Sorry, this app does not support window.eval().');
};

let loader = document.querySelector('.loader-icon');

function load() {
	loader.style.visibility = 'visible';
	timeline.restart();
	jquery('.interact').prop('disabled', false);
}

function stop() {
	loader.style.visibility = 'hidden';
	timeline.stop();
	jquery('.interact').prop('disabled', true);
}

// Open links in external browser.
jquery(document).on('click', 'a[href^="http"]', function (event) {
	event.preventDefault();
	shell.openExternal(this.href);
});

ipcRenderer.on('reload', () => {
	loadAll();
});

function loadAll() {
	loadProfiles()
		.then(profilesLoaded => {
			if (profilesLoaded) {
				getAllParameters()
					.then(() => {
						ipcRenderer.send('index-reload-complete');
					});
			} else {
				ipcRenderer.send('manage-profiles-open');
			}
		});
}

const addBtn = document.getElementById('add');
const deleteBtn = document.getElementById('delete');
const profilesSelect = document.getElementById('profiles');

function cloneClickListener(params) {
	let selectedRegions = [];

	params.api.forEachNode(rowNode => {
		if (rowNode.data.Name === params.data.Name) {
			selectedRegions.push(rowNode.data.Region);
		}
	});

	let data = {
		data: params.data,
		selectedRegions: selectedRegions
	};

	ipcRenderer.send('modify-open', JSON.stringify(data));
}

function deleteRows(rows) {
	load();
	deleteBtn.disabled = true;
	deleteParameters(rows)
		.then(() => {
			gridOptions.api.updateRowData({
				remove: rows
			});
		})
		.catch(err => {
			dialog.showErrorBox('Delete Failed', err.message);
		})
		.finally(() => {
			stop();
		});
}

let opt = {
	type: 'question',
	buttons: ['Cancel', 'OK'],
	defaultId: 1,
	title: 'Delete Parameter?',
	message: 'Are you sure you wish to delete this parameter?',
	cancelId: 0
};

function deleteClickListener(params) {
	if (params.data) {
		dialog.showMessageBox(opt, id => {
			if (id === 1) {
				deleteRows([params.data]);
			}
		});
	}
}

function getAllParameters() {
	load();
	return getParameters()
		.then(params => {
			gridOptions.api.setRowData(params);
		})
		.catch(err => {
			console.error(err, err.stack);
		})
		.finally(() => {
			gridOptions.columnApi.autoSizeAllColumns();
			stop();
		});
}

jquery('#filter-text-box').on('input', onFilterTextBoxChanged);

function onFilterTextBoxChanged() {
	gridOptions.api.setQuickFilter(document.getElementById('filter-text-box').value);
}

deleteBtn.addEventListener('click', () => {
	let selectedRows = gridOptions.api.getSelectedRows();

	if (!selectedRows || selectedRows.length <= 0) {
		return;
	}

	deleteRows(selectedRows);
});

addBtn.addEventListener('click', () => {
	ipcRenderer.send('modify-open');
});

let columnDefs = [{
		headerName: 'REGION',
		field: 'Region',
		checkboxSelection: true,
		minWidth: 142,
		maxWidth: 190,
	},
	{
		headerName: 'NAME',
		field: 'Name',
	},
	{
		headerName: 'TYPE',
		field: 'Type',
		minWidth: 140,
		maxWidth: 140,
	},
	{
		headerName: 'VALUE',
		field: 'Value',
		cellRenderer: function (params) {
			let val;

			if (!params.data) {
				return params.value;
			}

			val = params.data.Type !== 'SecureString' ? params.value : '******';

			return `<span>${val}</span>`;
		},
		editable: true
	},
	{
		headerName: 'VERSION',
		field: 'Version',
		maxWidth: 100,
		minWidth: 100,
	},
	{
		headerName: '',
		field: 'Controls',
		minWidth: 180,
		maxWidth: 180,
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return '<span class="controls"><i class="far fa-clone clone"></i><i class="far fa-edit edit"></i><i class="fas fa-trash-alt delete"></i></span>';
		},
	},

];

let gridOptions = {
	columnDefs: columnDefs,
	animateRows: true,
	rowData: null,
	enableColResize: true,
	enableSorting: true,
	singleClickEdit: true,
	rowSelection: 'multiple',
	rowHeight: 60,
	headerHeight: 60,
	onGridReady: function (params) {
		params.api.sizeColumnsToFit();

		window.addEventListener('resize', function () {
			setTimeout(function () {
				params.api.sizeColumnsToFit();
			});
		});
	},
	onRowDataChanged: function (params) {
		params.api.sizeColumnsToFit();
	},
	onCellClicked: function (params) {
		if (params.colDef.field === 'Controls' && params.event.path.length > 0) {
			let node = params.event.path.find(item => {
				return item && item.nodeName === 'svg';
			});

			if (!node) {
				return;
			}

			let classList = node.classList;
			if (classList.contains('edit')) {
				params.api.startEditingCell({
					rowIndex: params.node.rowIndex,
					colKey: 'Value'
				});
			} else if (classList.contains('clone')) {
				cloneClickListener(params);
			} else if (classList.contains('delete')) {
				deleteClickListener(params);
			}
		}
	},
	onCellValueChanged: function (params) {
		if (params.oldValue === params.value) {
			return;
		}

		updateParameter(params.data.Name, params.data.Type, params.data.Value, params.data.Region)
			.then((newVersion) => {
				params.data.Version = newVersion.Version;
				params.api.updateRowData({
					update: [params.data]
				});
			})
			.catch(err => {
				params.data.Value = params.oldValue;
				params.api.updateRowData({
					update: [params.data]
				});
				dialog.showErrorBox('Update Failed', 'Please make sure your credentials are correct and you have an internet connection.');
				console.error(err, err.stack);
			});
	}
};

let eGridDiv = document.querySelector('#parameter-grid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);

function loadProfiles() {
	return getProfiles()
		.then(profiles => {
			profilesSelect.options.length = 0;
			if (!profiles || profiles.length === 0) {
				stop();
				return false;
			}

			for (let i = 0; i < profiles.length; i++) {
				const profile = profiles[i];
				profilesSelect.options[profilesSelect.options.length] = new Option(profile.name, profile.name);
			}

			let jProf = jquery(profilesSelect);

			jProf.change(function () {
				setCredentials(this.value);
				getAllParameters();
			});

			setCredentials(jProf.val());

			return true;
		})
		.catch(() => {
			stop();
			addBtn.disabled = true;
			deleteBtn.disabled = true;
			profilesSelect.disabled = true;
			gridOptions.api.setRowData([]);

			return false;
		});
}

loadAll();
