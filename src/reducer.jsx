import { combineReducers } from 'redux';
import clone from 'clone';
import equals from 'fast-deep-equal';
import * as Type from './actions';

function selectedProfile(state = { profile: 'default' }, action) {
	switch (action.type) {
		case Type.SELECT_PROFILE:
			return Object.assign({}, clone(state), { profile: action.profile });
		default:
			return state;
	}
}

function profiles(state = [], action) {
	switch (action.type) {
		case Type.LOAD_PROFILES:
			return clone(action.profiles);
		default:
			return state;
	}
}

function regions(state = [], action) {
	switch (action.type) {
		case Type.LOAD_REGIONS:
			return clone(action.regions);
		default:
			return state;
	}
}

function selectedRegions(state = [], action) {
	switch (action.type) {
		case Type.SET_SELECTED_REGIONS:
			return clone(action.regions);
		default:
			return state;
	}
}

function parameters(state = { rowData: [], selectedRows: [], isFetching: false, didInvalidate: false }, action) {
	switch (action.type) {
		case Type.UPDATE_ROW:
			let newUpdateState = clone(state);

			let idx = newUpdateState.rowData.findIndex(r => {
				return r.Id === action.Id;
			});

			newUpdateState.rowData[idx].Version = action.newVersion;

			return newUpdateState;
		case Type.INVALIDATE_PROFILE:
			return Object.assign({}, state, { didInvalidate: true });
		case Type.REQUEST_PARAMETERS:
			return Object.assign({}, state, { didInvalidate: false, isFetching: true });
		case Type.RECEIVE_PARAMETERS:
			let newReceiveState = Object.assign({}, clone(state), { isFetching: false, didInvalidate: false, rowData: action.rowData });
			newReceiveState.rowData.forEach(row => {
				row.Id = row.Region + row.Name + row.Type;
			});
			return newReceiveState;
		case Type.SET_SELECTED_ROWS:
			return Object.assign({}, clone(state), { selectedRows: action.selectedRows });
		case Type.REMOVE_PARAMETERS:
			let newState = Object.assign({}, clone(state), { selectedRows: [] });

			// Remove selectedRows from rowData
			newState.rowData = newState.rowData.filter(d => {
				return action.itemsToRemove.findIndex(s => {
					return equals(d, s);
				}) < 0;
			});

			return newState;
		default:
			return state;
	}

}

function parametersByProfile(state = {}, action) {
	switch (action.type) {
		case Type.UPDATE_ROW:
		case Type.INVALIDATE_PROFILE:
		case Type.RECEIVE_PARAMETERS:
		case Type.SET_SELECTED_ROWS:
		case Type.REMOVE_PARAMETERS:
		case Type.REQUEST_PARAMETERS:
			return Object.assign({}, state, {
				[action.profile]: parameters(state[action.profile], action)
			});
		default:
			return state;
	}
}

function loading(state = false, action) {
	switch (action.type) {
		case Type.LOAD:
			return true;
		case Type.STOP_LOAD:
			return false;
		default:
			return state;
	}
}

const rootReducer = combineReducers({
	loading,
	profiles,
	regions,
	selectedRegions,
	parameters: parametersByProfile,
	selected: selectedProfile
});

export default rootReducer;

// export default (state = { rowData: [], profile: 'default' }, action) => {
// 	switch (action.type) {
// 		case UPDATE_ROW:
// 			return Object.assign({},
// 				state,
// 				{ rowData: action.rowData },
// 			);
// 		case 'CURRENCY_CHANGED':
// 			return Object.assign({},
// 				state,
// 				{
// 					currencySymbol: action.currencySymbol,
// 					exchangeRate: action.exchangeRate
// 				}
// 			);
// 		default:
// 			return state;
// 	}
// };
