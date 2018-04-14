const {
	ipcMain
} = require('electron');

ipcMain.on('modify-save-complete', () => {
	global.indexWindow.webContents.send('reload');
});
