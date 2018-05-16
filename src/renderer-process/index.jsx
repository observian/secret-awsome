import React from 'react';
import ReactDOM from 'react-dom';
import {
	AppContainer
} from 'react-hot-loader';

const render = () => {
	const IndexWindow = require('../IndexWindowComponent').default;
	ReactDOM.render(
		<AppContainer><IndexWindow /></AppContainer>,
		document.getElementById('App'));
};

render();

if (module.hot) {
	module.hot.accept(render);
}
