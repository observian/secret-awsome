const {
	ipcMain
} = require('electron');

ipcMain.on('profile-done', () => {
	global.profileWindow.hide();
});
