import React, { Component } from 'react';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';
import {
	electronEnhancer
} from 'redux-electron-store';
import Header from './ParameterHeaderComponent';
import ParameterGrid from './ParameterGridComponent';
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

export default class IndexWindowComponent extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Provider store={store}>
				<div>
					<h1>Get grid working</h1>
					<Header />
					<ParameterGrid />
				</div>
			</Provider>
		);
	}
};
