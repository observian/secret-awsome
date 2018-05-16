import React, { Component } from 'react';
import { connect } from 'react-redux';

function CheckboxItem(props) {
	return <div>
		<input type="checkbox" id={props.value} name={props.groupName ? props.groupName : 'checkboxGroup'} value={props.value} />
		<label htmlFor={props.value}>{props.value} ({props.displayName})</label>
	</div>;
}

function CheckboxGroup(props) {
	const items = props.items;

	const checkboxItems = items
		.map(item =>
			<CheckboxItem key={item.value} value={item.value} groupName={item.groupName} displayName={item.displayname} />
		);

	return (
		<div>
			{checkboxItems}
		</div>
	);
}

class CheckboxGroupComponent extends Component {
	constructor(props) {
		super(props);

		// this.CheckboxItem = this.CheckboxItem.bind(this);
		// this.CheckboxGroup = this.CheckboxGroup.bind(this);
	}

	componentDidMount() {
		//		this.props.dispatch(loadRegions());
	}

	regionsChanged(regions) {
		//		this.props.dispatch(setSelectedRegions(regions));
	}


	render() {
		return (
			<CheckboxGroup groupName={this.props.groupName} items={this.props.regions} />
		);
	}
}

export default connect(
	(state) => {
		return {
			regions: state.regions
		};
	}
)(CheckboxGroupComponent);
