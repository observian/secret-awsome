import React from 'react';
import ReactDOM from 'react-dom';
import {
	AppContainer
} from 'react-hot-loader';

const render = () => {
	const ModifyWindow = require('../ModifyWindowComponent').default;
	ReactDOM.render(
		<AppContainer><ModifyWindow /></AppContainer>,
		document.getElementById('Modify'));
};

render();

if (module.hot) {
	module.hot.accept(render);
}
