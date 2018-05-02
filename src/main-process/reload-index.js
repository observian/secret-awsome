import {
	ipcMain
} from 'electron';

ipcMain.on('reload-index', () => {
	global.indexWindow.webContents.send('reload');
});
