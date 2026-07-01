# Beatly Testing Guide

## Frontend

Run from `frontend`:

```powershell
npm run lint
npm test
npm run build
```

Coverage includes:

- component tests
- route rendering for critical protected pages
- empty/error state checks
- lazy-loaded Wrapped, Analytics, and floating AI panel safety
- offline queue persistence and replay behavior

## Backend

Run from `backend`:

```powershell
node --test tests/*.js
```

Coverage includes:

- health endpoints
- protected route rejection without auth
- `/api/sync/mutations`
- device/session ownership
- remote logout
- sync queue idempotency and retry/backoff

## Electron

Run after frontend build:

```powershell
cd desktop-client
npm run build:unpacked
npm run build:installer
```

Manual smoke still required:

- packaged app launches
- Spotify login works
- Dashboard loads
- Settings to Devices loads
- Socket.IO shows connected
- tray menu works
- app exits cleanly

## CI

GitHub Actions runs backend tests and frontend lint/test/build on pushes and pull requests for `main` and `develop`.
