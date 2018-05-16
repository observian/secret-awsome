import {
	ipcRenderer
} from 'electron';
import React, { Component } from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import {
	fetchParameters,
	selectProfile,
	removeParameters,
	setSelectedRows,
	loadProfiles
} from './actions';

class ParameterHeaderComponent extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(loadProfiles());
		this.selectProfile({ value: this.props.profile });
	}

	fetchParameters() {
		this.props.dispatch(fetchParameters(this.props.profile));
	}

	selectProfile(option) {
		this.props.dispatch(setSelectedRows(this.props.profile, []));

		if (!this.props.parameters[option.value]) {
			this.props.dispatch(fetchParameters(option.value));
		}

		this.props.dispatch(selectProfile(option.value));
	}

	removeParameters() {
		if (this.props.selectedRows.length > 0) {
			this.props.dispatch(removeParameters(this.props.profile, this.props.selectedRows));
		}
	}

	openModifyWindow() {
		ipcRenderer.send('open-modify-window');
	}

	render() {
		return (
			<div style={{ marginTop: 15 }}>
				<Select
					id="profiles"
					name="allprofiles"
					className="primary"
					value={this.props.profile}
					options={this.props.profiles}
					onChange={this.selectProfile.bind(this)}
				/>
				<button onClick={this.fetchParameters.bind(this)} id='get-all-parameters' className='interact'>Refresh</button>
				<button onClick={this.openModifyWindow.bind(this)} id='add' className='interact'>Add</button>
				<button onClick={this.removeParameters.bind(this)} id='delete' className='interact'>Delete</button>
				<input type="search" id="filter-text-box" className='interact' placeholder="Filter..." />

			</div>
		);
	}
}

// pull off row data
export default connect(
	(state) => {
		return {
			profile: state.selected.profile,
			profiles: state.profiles,
			parameters: state.parameters,
			selectedRows: state.parameters[state.selected.profile] ? state.parameters[state.selected.profile].selectedRows : []
		};
	}
)(ParameterHeaderComponent);
