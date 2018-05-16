import {
	updateParameter,
	getParameters,
	deleteParameters,
	defaultRegions,
} from './api/ssm';
import {
	getProfiles
} from './api/profile';

export const UPDATE_ROW = 'UPDATE_ROW';
export function updateRow(profile, row) {
	return function (dispatch) {
		dispatch(load());

		return updateParameter(row.Name, row.Type, row.Value, row.Region)
			.then(newVersion => {
				dispatch((() => {
					return {
						type: UPDATE_ROW,
						profile,
						Id: row.Id,
						newVersion: newVersion.Version
					};
				})());

				dispatch(stopLoad());
			});
	};
}

export const LOAD_PROFILES = 'LOAD_PROFILES';
export function loadProfiles() {
	return function (dispatch) {
		return getProfiles()
			.then(profiles => {
				let opts = [];
				for (let i = 0; i < profiles.length; i++) {
					const profile = profiles[i];
					opts.push({ value: profile.name, label: profile.name });
				}

				return opts;
			})
			.then(profiles => {
				dispatch((() => {
					return {
						type: LOAD_PROFILES,
						profiles: profiles
					};
				})());
			});
	};
}

export const LOAD_REGIONS = 'LOAD_REGIONS';
export function loadRegions() {
	return {
		type: LOAD_REGIONS,
		regions: defaultRegions.regions
	};
}

export const SET_SELECTED_REGIONS = 'SET_SELECTED_REGIONS';
export function setSelectedRegions(regionNames) {
	return {
		type: SET_SELECTED_REGIONS,
		regions: regionNames
	};
}

export const REQUEST_PARAMETERS = 'REQUEST_PARAMETERS';
export function requestParameters(profile) {
	return {
		type: REQUEST_PARAMETERS,
		profile
	};
}

export const INVALIDATE_PROFILE = 'INVALIDATE_PROFILE';
export function invalidateProfile(profile) {
	return {
		type: INVALIDATE_PROFILE,
		profile
	};
}

export const SELECT_PROFILE = 'SELECT_PROFILE';
export function selectProfile(profile) {
	return {
		type: SELECT_PROFILE,
		profile
	};
}

export const SET_SELECTED_ROWS = 'SET_SELECTED_ROWS';
export function setSelectedRows(profile, selectedRows) {
	return {
		type: SET_SELECTED_ROWS,
		profile,
		selectedRows
	};
}

export const RECEIVE_PARAMETERS = 'RECEIVE_PARAMETERS';
export function receiveParameters(profile, data) {
	return {
		type: RECEIVE_PARAMETERS,
		profile,
		rowData: data
	};
}

export const LOAD = 'LOAD';
export function load() {
	return {
		type: LOAD
	};
}

export const STOP_LOAD = 'STOP_LOAD';
export function stopLoad() {
	return {
		type: STOP_LOAD
	};
}

export function fetchParameters(profile) {
	return function (dispatch) {
		dispatch(requestParameters(profile));
		dispatch(load());

		return getParameters(null, profile)
			.then(data => {
				dispatch(receiveParameters(profile, data));
				dispatch(stopLoad());
			});
	};
}

export const REMOVE_PARAMETERS = 'REMOVE_PARAMETERS';
export function removeParameters(profile, itemsToRemove) {
	return function (dispatch) {
		dispatch(load());

		return deleteParameters(itemsToRemove)
			.then(() => {
				dispatch(stopLoad());

				dispatch((() => {
					return {
						type: REMOVE_PARAMETERS,
						profile,
						itemsToRemove
					};
				})());
			});
	};
}
