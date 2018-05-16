import React from 'react';
import * as PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

export default class ValueCellRenderer extends React.Component {

	render() {
		let val;

		if (!this.props.data) {
			return this.props.value;
		}

		val = this.props.data.Type !== 'SecureString' ? this.props.value : '******';

		return <span className='clickable'>
			<FontAwesome
				name='edit'
				className='far'
			/>
			{val}
		</span>;
	}

}

// the grid will always pass in one props called 'params',
// which is the grid passing you the params for the cellRenderer.
// this piece is optional. the grid will always pass the 'params'
// props, so little need for adding this validation meta-data.
ValueCellRenderer.propTypes = {
	params: PropTypes.object
};
