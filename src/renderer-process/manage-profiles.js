import {
	getProfiles,
	saveProfiles
} from '../api/profile';

import {
	ipcRenderer
} from 'electron';

import {
	Grid
} from 'ag-grid';

import {
	remote
} from 'electron';

const {
	dialog
} = remote;

const saveProfilesBtn = document.getElementById('save-profile');
const addBtn = document.getElementById('add-profile');
const deleteBtn = document.getElementById('delete-profile');
const cancelBtn = document.getElementById('cancel-profile');

function getAllProfiles() {
	return getProfiles()
		.then(profiles => {
			gridOptions.api.setRowData(profiles);
		})
		.catch(err => {
			console.error(err, err.stack);
		})
		.finally(() => {
			gridOptions.columnApi.autoSizeAllColumns();
		});
}

saveProfilesBtn.addEventListener('click', () => {
	let profiles = [];
	gridOptions.api.stopEditing();

	let opt = {
		type: 'question',
		buttons: ['Cancel', 'OK'],
		defaultId: 1,
		title: 'Overwrite Credentials File?',
		message: 'Are you sure you wish to overwrite the AWS credentials file?',
		cancelId: 0
	};

	dialog.showMessageBox(opt, id => {
		if (id === 1) {
			gridOptions.api.forEachNode(node => {
				profiles.push(node.data);
			});
			saveProfiles(profiles);
			ipcRenderer.send('reload-index');
			saveProfilesBtn.blur();
		}
	});

});

deleteBtn.addEventListener('click', () => {
	let selectedRows = gridOptions.api.getSelectedRows();

	if (!selectedRows || selectedRows.length <= 0) {
		return;
	}

	gridOptions.api.updateRowData({
		remove: selectedRows
	});

});

addBtn.addEventListener('click', () => {
	gridOptions.api.updateRowData({
		add: [{
			name: 'new_profile',
			aws_access_key_id: '',
			aws_secret_access_key: ''
		}]
	});
});

cancelBtn.addEventListener('click', () => {
	ipcRenderer.send('profile-done');
	cancelBtn.blur();
});

let columnDefs = [{
		headerName: 'Name',
		field: 'name',
		minWidth: 150,
		checkboxSelection: true,
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return `<span class="clickable"><i class="far fa-edit"></i>${params.value}</span>`;
		},
		editable: true
	},
	{
		headerName: 'Access Key',
		field: 'aws_access_key_id',
		minWidth: 200,
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return `<span class="clickable"><i class="far fa-edit"></i>${params.value}</span>`;
		},
		editable: true
	},
	{
		headerName: 'Secret Key',
		field: 'aws_secret_access_key',
		minWidth: 280,
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			let val = '******';

			if (!params.value) {
				val = '';
			}

			return `<span class="clickable"><i class="far fa-edit"></i>${val}</span>`;
		},
		editable: true
	},
	{
		headerName: 'Region*',
		field: 'region',
		minWidth: 110,
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return `<span class="clickable"><i class="far fa-edit"></i>${params.value || ''}</span>`;
		},
		editable: true
	},
	{
		headerName: 'Output*',
		field: 'output',
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return `<span class="clickable"><i class="far fa-edit"></i>${params.value || ''}</span>`;
		},
		editable: true
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
	}
};

let eGridDiv = document.querySelector('#profiles-grid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);

ipcRenderer.on('open-message', () => {
	getAllProfiles();
});

getAllProfiles();
