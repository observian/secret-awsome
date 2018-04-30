const {
	ipcMain
} = require('electron');

ipcMain.on('index-reload-complete', () => {
	global.modifyWindow.hide();
	global.profileWindow.hide();
});
