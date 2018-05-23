import {
	ipcMain
} from 'electron';

ipcMain.on('modify-add', (event, arg) => {
	global.modifyWindow.webContents.send('open', arg);
	global.modifyWindow.setTitle('Add');
	global.modifyWindow.show();
});
