import {
	ipcMain
} from 'electron';

ipcMain.on('modify-clone', (event, arg) => {
	global.modifyWindow.webContents.send('open', arg);
	global.modifyWindow.setTitle('Clone');
	global.modifyWindow.show();
});
