import {
	ipcMain
} from 'electron';

ipcMain.on('index-reload-complete', () => {
	global.modifyWindow.hide();
	global.profileWindow.hide();
});
