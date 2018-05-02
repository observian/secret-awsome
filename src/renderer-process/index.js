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
	ipcRenderer
} from 'electron';

import jquery from 'jquery';

import {
	Grid
} from 'ag-grid';

import {
	remote
} from 'electron';

const {
	dialog
} = remote;

let loader = document.getElementById('load');
loader.load = function () {
	this.style.visibility = 'visible';
	jquery('.interact').prop('disabled', true);
};

loader.stop = function () {
	this.style.visibility = 'hidden';
	jquery('.interact').prop('disabled', false);
};

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

const getAllParamsBtn = document.getElementById('get-all-parameters');
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

function getAllParameters() {
	loader.load();
	return getParameters()
		.then(params => {
			gridOptions.api.setRowData(params);
			// gridOptions.api.updateRowData({
			// 	add: params
			// });
		})
		.catch(err => {
			console.error(err, err.stack);
		})
		.finally(() => {
			gridOptions.columnApi.autoSizeAllColumns();
			loader.stop();
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

	loader.load();
	deleteBtn.disabled = true;
	deleteParameters(selectedRows)
		.then(() => {
			gridOptions.api.updateRowData({
				remove: selectedRows
			});
		})
		.catch(err => {
			dialog.showErrorBox('Delete Failed', err.message);
		})
		.finally(() => {
			loader.stop();
		});
});

getAllParamsBtn.addEventListener('click', () => {
	getAllParameters();
});

addBtn.addEventListener('click', () => {
	ipcRenderer.send('modify-open');
});

let columnDefs = [{
		headerName: 'Region',
		field: 'Region',
		checkboxSelection: true
	},
	{
		headerName: 'Name',
		field: 'Name',
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return `<span class="clickable"><i class="far fa-clone"></i>${params.value}</span>`;
		},
	},
	{
		headerName: 'Type',
		field: 'Type'
	},
	{
		headerName: 'Value',
		field: 'Value',
		cellRenderer: function (params) {
			let val;

			if (!params.data) {
				return params.value;
			}

			val = params.data.Type !== 'SecureString' ? params.value : '******';

			return `<span class="clickable"><i class="far fa-edit"></i>${val}</span>`;
		},
		editable: true
	},
	{
		headerName: 'Version',
		field: 'Version'
	}
];

let gridOptions = {
	columnDefs: columnDefs,
	animateRows: true,
	rowData: null,
	enableColResize: true,
	enableSorting: true,
	singleClickEdit: true,
	rowSelection: 'multiple',
	onGridReady: function (params) {
		params.columnApi.autoSizeAllColumns();
	},
	onRowGroupOpened: function (params) {
		params.columnApi.autoSizeAllColumns();
	},
	onCellClicked: function (params) {
		if (params.colDef.field === 'Name') {
			cloneClickListener(params);
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

let eGridDiv = document.querySelector('#parameterGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);

function loadProfiles() {
	return getProfiles()
		.then(profiles => {
			profilesSelect.options.length = 0;
			if (!profiles || profiles.length === 0) {
				loader.stop();
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
			loader.stop();
			getAllParamsBtn.disabled = true;
			addBtn.disabled = true;
			deleteBtn.disabled = true;
			profilesSelect.disabled = true;
			gridOptions.api.setRowData([]);

			return false;
		});
}

loadAll();
