import {
	updateParameter,
	getParameters
} from '../api/ssm';
import {
	ipcRenderer
} from 'electron';
let jquery = require('jquery');
let agGrid = require('ag-grid');
const {
	dialog
} = require('electron').remote;

let loader = document.getElementById('load');
loader.load = function () {
	this.style.visibility = 'visible';
	document.getElementById('main').setAttribute('disabled', 'true');
};

loader.stop = function () {
	this.style.visibility = 'hidden';
	document.getElementById('main').setAttribute('disabled', 'false');
};

ipcRenderer.on('reload', () => {
	getAll()
		.then(() => {
			ipcRenderer.send('index-refresh-complete');
		});
});

const getAllParamsBtn = document.getElementById('get-all-parameters');
const addBtn = document.getElementById('add');

function cloneClickListener(data) {
	ipcRenderer.send('modify-open', JSON.stringify(data));
}

function getAll() {
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

getAllParamsBtn.addEventListener('click', () => {
	getAll();
});

addBtn.addEventListener('click', () => {
	ipcRenderer.send('modify-open');
});

let columnDefs = [{
		headerName: 'Region',
		field: 'Region',
		sort: 'asc'
	},
	{
		headerName: 'Name',
		field: 'Name',
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return '<span class="clickable"><i class="far fa-clone"></i></span>' + params.value;
		},
	},
	{
		headerName: 'Type',
		field: 'Type'
	},
	{
		headerName: 'Value',
		field: 'Value',
		valueFormatter: function (params) {
			if (!params.data || params.data.Type !== 'SecureString') {
				return params.value;
			}

			return '******';
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
	onGridReady: function (params) {
		params.columnApi.autoSizeAllColumns();
	},
	onRowGroupOpened: function (params) {
		params.columnApi.autoSizeAllColumns();
	},
	onCellClicked: function (params) {
		if (params.colDef.field === 'Name') {
			cloneClickListener(params.data);
		}
	},
	onCellValueChanged: function (params) {
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

let eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

getAll();
