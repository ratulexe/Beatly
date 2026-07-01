const { app, BrowserWindow, ipcMain, Notification, shell } = require('electron');
const path = require('path');
const { setupUpdater } = require('./updater');
const { setupTray } = require('./tray');

let mainWindow;
let tray;
const FRONTEND_DEV_URL = process.env.BEATLY_ELECTRON_DEV_URL || 'http://127.0.0.1:5173';
const FRONTEND_DEV_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
const APP_ID = 'com.beatly.desktop';

function getFrontendIndexPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'frontend/dist/index.html')
    : path.join(__dirname, '../../frontend/dist/index.html');
}

function loadProductionRoute(routePath = '/') {
  const safeRoute = routePath.startsWith('/') ? routePath : '/';
  return mainWindow.loadFile(getFrontendIndexPath()).then(() => {
    if (safeRoute !== '/') {
      return mainWindow.webContents.executeJavaScript(
        `window.location.hash = ${JSON.stringify(safeRoute)};`,
        true
      );
    }
    return null;
  });
}

function isFrontendDevUrl(url) {
  try {
    return FRONTEND_DEV_ORIGINS.has(new URL(url).origin);
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Check if we are in development mode (running Vite dev server)
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL(FRONTEND_DEV_URL);
    if (process.env.BEATLY_ELECTRON_OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    loadProductionRoute();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://open.spotify.com/')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!app.isPackaged || !isFrontendDevUrl(url)) return;
    event.preventDefault();
    const routePath = new URL(url).pathname || '/';
    loadProductionRoute(routePath).catch((error) => {
      console.error('Failed to load packaged route after OAuth redirect:', error);
    });
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);
  createWindow();
  tray = setupTray(mainWindow);
  setupUpdater(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC communication
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('show-notification', (_event, { title, body }) => {
  if (!Notification.isSupported()) return false;

  new Notification({
    title: String(title || 'Beatly').slice(0, 80),
    body: String(body || '').slice(0, 240)
  }).show();

  return true;
});
