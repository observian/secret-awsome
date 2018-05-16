import {
	app,
	BrowserWindow,
	ipcMain,
} from 'electron';
import installExtension, {
	REACT_DEVELOPER_TOOLS,
	REDUX_DEVTOOLS
} from 'electron-devtools-installer';
import {
	enableLiveReload,
} from 'electron-compile';
import thunkMiddleware from 'redux-thunk';
import {
	createLogger
} from 'redux-logger';
import {
	createStore,
	applyMiddleware,
	compose
} from 'redux';
import {
	electronEnhancer
} from 'redux-electron-store';
import {
	join
} from 'path';
import {
	format
} from 'url';
import rootReducer from './reducer';

const loggerMiddleware = createLogger();

let enhancer = compose(
	applyMiddleware(
		thunkMiddleware,
		loggerMiddleware
	),
	// Must be placed after any enhancers which dispatch
	// their own actions such as redux-thunk or redux-saga
	electronEnhancer({
		// Necessary for synched actions to pass through all enhancers
		dispatchProxy: a => store.dispatch(a),
	})
);

let store = createStore(
	rootReducer, {},
	enhancer
);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let indexWindow;
let modifyWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
	enableLiveReload({
		strategy: 'react-hmr',
	});
}

const createWindow = async () => {
	// Create the browser window.
	indexWindow = new BrowserWindow({
		width: 1324,
		height: 768,
	});

	// and load the index.html of the app.
	indexWindow.loadURL(format({
		pathname: join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	if (isDevMode) {
		await installExtension(REACT_DEVELOPER_TOOLS);
		await installExtension(REDUX_DEVTOOLS);
		indexWindow.webContents.openDevTools();
	}

	// Emitted when the window is closed.
	indexWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		indexWindow = null;
		modifyWindow = null;
	});
};

const createModifyWindow = async () => {
	// Create the browser window.
	modifyWindow = new BrowserWindow({
		width: 800,
		height: 600,
		parent: indexWindow,
		modal: false,
		show: false
	});

	// and load the index.html of the app.
	modifyWindow.loadURL(format({
		pathname: join(__dirname, 'modify.html'),
		protocol: 'file:',
		slashes: true
	}));

	if (isDevMode) {
		await installExtension(REACT_DEVELOPER_TOOLS);
		await installExtension(REDUX_DEVTOOLS);
		modifyWindow.webContents.openDevTools();
	}

	// Emitted when the window is closed.
	modifyWindow.on('close', ev => {
		ev.preventDefault();
		modifyWindow.hide();
	});

	// Emitted when the window is closed.
	modifyWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		modifyWindow = null;
	});

	global.modifyWindow = modifyWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	await createWindow();
	await createModifyWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	//if (process.platform !== 'darwin') {
	app.quit();
	//}
});

app.on('activate', async () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (indexWindow === null) {
		await createWindow();
		await createModifyWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('open-modify-window', (event, arg) => {
	global.modifyWindow.webContents.send('open', arg ? arg : ['us-east-1']);
	global.modifyWindow.setTitle(arg ? 'Clone' : 'Add');
	global.modifyWindow.show();
});
