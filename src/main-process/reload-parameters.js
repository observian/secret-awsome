import {
	ipcMain
} from 'electron';

ipcMain.on('reload-parameters', () => {
	global.indexWindow.webContents.send('reload');
});
