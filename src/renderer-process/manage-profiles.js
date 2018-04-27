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

const saveProfilesBtn = document.getElementById('save-profiles');
const addBtn = document.getElementById('add-profile');
const deleteBtn = document.getElementById('delete-profile');

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
	gridOptions.api.forEachNode(node => {
		profiles.push(node.data);
	});
	saveProfiles(profiles);
	ipcRenderer.send('profile-done');
	ipcRenderer.send('reload-index');
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

let columnDefs = [{
		headerName: 'Name',
		field: 'name',
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
		cellRenderer: function (params) {
			if (!params.data) {
				return params.value;
			}

			return '<span class="clickable"><i class="far fa-edit"></i>******</span>';
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

let eGridDiv = document.querySelector('#profilesGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new Grid(eGridDiv, gridOptions);

ipcRenderer.on('open-message', () => {
	getAllProfiles();
});

getAllProfiles();
