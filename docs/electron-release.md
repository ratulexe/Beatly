# Beatly Electron Release Guide

Beatly's active desktop app lives in `desktop-client`. There should be no active `desktop` or `desktop-app` project beside it.

## Development Run

1. Start the backend on `http://127.0.0.1:5000`.
2. Start the frontend dev server on `http://127.0.0.1:5173`.
3. Run Electron from `desktop-client`:

```powershell
npm start
```

Optional development environment variables:

```powershell
$env:NODE_ENV = "development"
$env:BEATLY_ELECTRON_DEV_URL = "http://127.0.0.1:5173"
$env:BEATLY_ELECTRON_OPEN_DEVTOOLS = "true"
```

DevTools are opt-in. Do not enable `BEATLY_ELECTRON_OPEN_DEVTOOLS` for production release verification.

## Production Build Inputs

Build the frontend first from `frontend`:

```powershell
npm run build
```

The Electron package includes `../frontend/dist` as an extra resource and loads it from `process.resourcesPath` in packaged mode.

The packaged app expects the Beatly backend API to be reachable at `http://127.0.0.1:5000` unless the frontend API client is changed for a hosted backend release. The backend CORS configuration intentionally allows Electron's `null` origin for packaged `file://` loading.

## Build Commands

From `desktop-client`:

```powershell
npm run build:unpacked
npm run build:installer
```

`build:unpacked` produces a Windows unpacked app under `desktop-client/dist/win-unpacked`.

`build:installer` produces the NSIS installer under `desktop-client/dist`.

## Security Checklist

- `contextIsolation` is enabled.
- `nodeIntegration` is disabled.
- Renderer sandboxing is enabled.
- The preload exposes only allowlisted desktop APIs:
  - `getAppVersion`
  - `showNotification`
  - `onSyncEvent`
  - `onDesktopEvent` for explicit desktop event names only
- Notification IPC trims title/body length before sending to Electron.
- Arbitrary renderer file/system access is not exposed.
- External Spotify links open through the OS browser instead of creating arbitrary app windows.
- Auto-update checks are disabled unless `BEATLY_ENABLE_AUTO_UPDATE=true` is set in a packaged app.

## Required Environment

Backend:

```text
MONGODB_URI
SESSION_SECRET
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REDIRECT_URI=http://localhost:5000/api/auth/callback
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

Electron:

```text
BEATLY_ENABLE_AUTO_UPDATE=true   # only after real publish config is added
```

Do not bundle secrets into Electron. Spotify, database, and session secrets belong to the backend environment only.

## Signing And Publishing

Windows code signing is not configured yet. Release builds should be treated as unsigned until a real certificate is available.

Required future signing items:

- Windows code-signing certificate.
- Secure CI secret storage for signing credentials.
- Signed NSIS installer verification on a clean Windows machine.

Auto-update publishing is intentionally not configured with a fake provider. Before enabling `BEATLY_ENABLE_AUTO_UPDATE`, add a real electron-builder `publish` provider and verify that update metadata is generated and hosted.

## Known Limitations

- The packaged app currently assumes a reachable Beatly backend at `http://127.0.0.1:5000`.
- OAuth redirects that return to the browser dev origin are bridged back into the packaged frontend by the Electron main process.
- Full two-device Socket.IO behavior should still be smoke-tested manually before public release.
- Unsigned Windows installers can trigger SmartScreen warnings.
