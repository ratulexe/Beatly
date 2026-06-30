const { autoUpdater } = require('electron-updater');

function setupUpdater(mainWindow) {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('updater-event', { type: 'update-available' });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updater-event', { type: 'update-downloaded' });
  });
}

module.exports = { setupUpdater };
