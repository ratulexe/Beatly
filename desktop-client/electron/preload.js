const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  onSyncEvent: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('sync-event', handler);
    return () => ipcRenderer.removeListener('sync-event', handler);
  },
});
