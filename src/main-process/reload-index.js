const {
	ipcMain
} = require('electron');

ipcMain.on('reload-index', () => {
	global.indexWindow.webContents.send('reload');
});
