import React, { Component } from 'react';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { connect } from 'react-redux';
import NameCellRenderer from './NameCellRenderer.jsx';
import ValueCellRenderer from './ValueCellRenderer.jsx';
import {
	setSelectedRows,
	updateRow
} from './actions';

class ParameterGridComponent extends Component {
	constructor() {
		super();

		this.state = {
			rowData: null,
			filterText: null,
		};

		this.onGridReady = this.onGridReady.bind(this);
		this.onSelectionChanged = this.onSelectionChanged.bind(this);
		this.onCellValueChanged = this.onCellValueChanged.bind(this);
		this.getRowNodeId = this.getRowNodeId.bind(this);
	}

	onGridReady(params) {
		this.gridApi = params.api;
		this.columnApi = params.columnApi;

		this.gridApi.sizeColumnsToFit();
	}

	onSelectionChanged(params) {
		let selectedRows = params.api.getSelectedRows();
		this.props.dispatch(setSelectedRows(this.props.profile, selectedRows));
	}

	onCellValueChanged(params) {
		if (params.oldValue === params.value) {
			return;
		}

		this.props.dispatch(updateRow(this.props.profile, params.data));
	}

	getRowNodeId(data) {
		return data.Id;
	}

	// row data will be provided via redux on this.props.rowData
	render() {
		return (
			<div style={{ height: 400, width: 900, marginTop: 15 }}
				className="ag-theme-balham">
				<div className={this.props.loading ? '' : 'hidden'}>LOADING</div>
				<AgGridReact
					// properties
					rowData={this.props.rowData}
					animateRows
					enableColResize
					enableSorting
					enableFilter
					singleClickEdit
					rowSelection='multiple'
					deltaRowDataMode
					enableCellChangeFlash
					// events
					onGridReady={this.onGridReady}
					onSelectionChanged={this.onSelectionChanged}
					onCellValueChanged={this.onCellValueChanged}
					getRowNodeId={this.getRowNodeId}
				>
					<AgGridColumn field="Region" headerName="Region" checkboxSelection></AgGridColumn>
					<AgGridColumn field="Name" headerName="Name" cellRendererFramework={NameCellRenderer}></AgGridColumn>
					<AgGridColumn field="Type" headerName="Type"></AgGridColumn>
					<AgGridColumn field="Value" headerName="Value" suppressCellFlash editable cellRendererFramework={ValueCellRenderer}></AgGridColumn>
					<AgGridColumn field="Version" headerName="Version"></AgGridColumn>
				</AgGridReact>
			</div>
		);
	}
}

export default connect(
	(state) => {
		return {
			loading: state.loading,
			profile: state.selected.profile,
			rowData: state.parameters[state.selected.profile] ? state.parameters[state.selected.profile].rowData : null
		};
	}
)(ParameterGridComponent);
