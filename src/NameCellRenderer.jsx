import React from 'react';
import * as PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

export default class NameCellRenderer extends React.Component {

	render() {
		if (!this.props.data) {
			return this.props.value;
		}

		return <span className='clickable'>
			<FontAwesome
				name='clone'
				className='far'
			/>
			{this.props.value}
		</span>;
	}

}

// the grid will always pass in one props called 'params',
// which is the grid passing you the params for the cellRenderer.
// this piece is optional. the grid will always pass the 'params'
// props, so little need for adding this validation meta-data.
NameCellRenderer.propTypes = {
	params: PropTypes.object
};
