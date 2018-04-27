const {
	ipcMain
} = require('electron');

ipcMain.on('manage-profiles-open', (event, arg) => {
	global.profileWindow.webContents.send('open-message', arg);
	global.profileWindow.show();
});
