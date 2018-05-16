import React, { Component } from 'react';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';
import {
	electronEnhancer
} from 'redux-electron-store';
import {
	ipcRenderer
} from 'electron';
import {
	setSelectedRegions
} from './actions';
import CheckboxGroup from './CheckboxGroupComponent';
import {
	loadRegions
} from './actions';
import rootReducer from './reducer';

const loggerMiddleware = createLogger();

let enhancer = compose(
	applyMiddleware(
		thunkMiddleware,
		loggerMiddleware
	),
	electronEnhancer({
		dispatchProxy: a => store.dispatch(a),
	})
);

let store = createStore(
	rootReducer, {}, enhancer
);

export default class ModifyWindowComponent extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		store.dispatch(loadRegions());

		ipcRenderer.on('open', args => {
			store.dispatch(setSelectedRegions(args && args.regions ? args.regions : []));
		});
	}

	render() {
		return (
			<Provider store={store}>
				<div>
					<h1>Modify</h1>
					<form id='region-form' name='region-form'>
						<input type="text" id="name" name="name" />
						<select id="parameter-type-region" name="type">
							<option value="String">String</option>
							<option value="StringList">StringList</option>
							<option value="SecureString">SecureString</option>
						</select>
						<input type="text" id="value" name="value" />
						<CheckboxGroup groupName='region' />
						<button type="submit">Save</button>
					</form>
				</div>
			</Provider>
		);
	}
}
