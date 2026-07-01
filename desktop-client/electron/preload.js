const { contextBridge, ipcRenderer } = require('electron');

const safeString = (value, maxLength) => String(value || '').slice(0, maxLength);
const allowedEvents = new Set(['sync-event', 'updater-event', 'force-sync']);

contextBridge.exposeInMainWorld('electronAPI', {
  config: Object.freeze({
    apiBaseUrl: safeString(process.env.BEATLY_API_BASE_URL, 240),
    socketUrl: safeString(process.env.BEATLY_SOCKET_URL, 240),
  }),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', {
    title: safeString(title || 'Beatly', 80),
    body: safeString(body, 240),
  }),
  onSyncEvent: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('sync-event', handler);
    return () => ipcRenderer.removeListener('sync-event', handler);
  },
  onDesktopEvent: (channel, callback) => {
    if (!allowedEvents.has(channel) || typeof callback !== 'function') return () => {};
    const handler = (_event, value) => callback(value);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
});
