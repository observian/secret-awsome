const {
	ipcMain
} = require('electron');

ipcMain.on('index-refresh-complete', () => {
	global.modifyWindow.hide();
});
