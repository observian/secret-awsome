const {
	app,
	BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');
const glob = require('glob');

if (require('electron-squirrel-startup')) app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let indexWindow = {};
let modifyWindow = {};

const debug = /--debug|--inspect-brk/.test(process.argv[2]);

function createIndexWindow(width, height, view) {
	// Create the browser window.
	indexWindow = new BrowserWindow({
		width: width,
		height: height
	});

	// and load the index.html of the app.
	indexWindow.loadURL(url.format({
		pathname: path.join(__dirname, view),
		protocol: 'file:',
		slashes: true
	}));

	// Launch fullscreen with DevTools open, usage: npm run debug
	if (debug) {
		indexWindow.webContents.openDevTools();
		//mainWindow.maximize();
		require('devtron').install();
	}

	// Emitted when the window is closed.
	indexWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		indexWindow = null;
		modifyWindow = null;
	});

	global.indexWindow = indexWindow;
}

function createModifyWindow(width, height, view) {
	// Create the browser window.
	modifyWindow = new BrowserWindow({
		width: width,
		height: height,
		parent: indexWindow,
		modal: false,
		show: false
	});

	// and load the index.html of the app.
	modifyWindow.loadURL(url.format({
		pathname: path.join(__dirname, view),
		protocol: 'file:',
		slashes: true
	}));

	// Launch fullscreen with DevTools open, usage: npm run debug
	if (debug) {
		modifyWindow.webContents.openDevTools();
		//mainWindow.maximize();
		require('devtron').install();
	}

	// Emitted when the window is closed.
	modifyWindow.on('close', ev => {
		ev.preventDefault();
		modifyWindow.hide();
	});

	global.modifyWindow = modifyWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createIndexWindow(1324, 768, 'index.html');
	createModifyWindow(800, 600, 'modify.html');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	//if (process.platform !== 'darwin') {
	app.quit();
	//}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (!indexWindow) {
		createIndexWindow(1324, 768, 'index.html');
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// Require each JS file in the main-process dir
function loadMain() {
	// this should be placed at top of main.js to handle setup events quickly
	if (handleSquirrelEvent()) {
		// squirrel event handled and app will exit in 1000ms, so don't do anything else
		return;
	}


	const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
	files.forEach((file) => {
		require(file);
	});
}

loadMain();


function handleSquirrelEvent() {
	if (process.argv.length === 1) {
		return false;
	}

	const ChildProcess = require('child_process');
	const path = require('path');

	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = path.basename(process.execPath);

	const spawn = function (command, args) {
		let spawnedProcess;

		try {
			spawnedProcess = ChildProcess.spawn(command, args, {
				detached: true
			});
		} catch (error) {}

		return spawnedProcess;
	};

	const spawnUpdate = function (args) {
		return spawn(updateDotExe, args);
	};

	const squirrelEvent = process.argv.find(item => {
		return item.startsWith('--squirrel');
	});
	switch (squirrelEvent) {
		case '--squirrel-install':
		case '--squirrel-updated':
			// Optionally do things such as:
			// - Add your .exe to the PATH
			// - Write to the registry for things like file associations and
			//   explorer context menus

			// Install desktop and start menu shortcuts
			spawnUpdate(['--createShortcut', exeName]);

			setTimeout(app.quit, 1000);
			return true;

		case '--squirrel-uninstall':
			// Undo anything you did in the --squirrel-install and
			// --squirrel-updated handlers

			// Remove desktop and start menu shortcuts
			spawnUpdate(['--removeShortcut', exeName]);

			setTimeout(app.quit, 1000);
			return true;

		case '--squirrel-obsolete':
			// This is called on the outgoing version of your app before
			// we update to the new version - it's the opposite of
			// --squirrel-updated

			app.quit();
			return true;
	}
};
