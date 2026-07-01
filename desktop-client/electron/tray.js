const { Tray, Menu, app } = require('electron');
const path = require('path');

function setupTray(mainWindow) {
  const tray = new Tray(path.join(__dirname, 'icon.png'));
  const withWindow = (action) => {
    if (mainWindow && !mainWindow.isDestroyed()) action(mainWindow);
  };
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Beatly', click: () => withWindow((window) => window.show()) },
    { type: 'separator' },
    { label: 'Sync Now', click: () => withWindow((window) => window.webContents.send('force-sync')) },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      app.isQuiting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('Beatly Desktop');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  return tray;
}

module.exports = { setupTray };
