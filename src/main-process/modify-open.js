import {
	ipcMain
} from 'electron';

ipcMain.on('modify-open', (event, arg) => {
	global.modifyWindow.webContents.send('open-message', arg);
	global.modifyWindow.setTitle(arg ? 'Clone' : 'Add');
	global.modifyWindow.show();
});
