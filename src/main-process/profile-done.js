import {
	ipcMain
} from 'electron';

ipcMain.on('profile-done', () => {
	global.profileWindow.hide();
});
