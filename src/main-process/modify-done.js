import {
	ipcMain
} from 'electron';

ipcMain.on('modify-done', () => {
	global.modifyWindow.hide();
});
