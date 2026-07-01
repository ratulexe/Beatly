const { app } = require('electron');

function setupUpdater(mainWindow) {
  if (!app.isPackaged || process.env.BEATLY_ENABLE_AUTO_UPDATE !== 'true') {
    return;
  }

  const { autoUpdater } = require('electron-updater');
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('updater-event', { type: 'update-available' });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('updater-event', { type: 'update-downloaded' });
  });
}

module.exports = { setupUpdater };
