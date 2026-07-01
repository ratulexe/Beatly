# Beatly Deployment Guide

## Frontend

Build from `frontend`:

```powershell
pnpm run build
```

Output is written to `frontend/dist`.

Required frontend env:

```text
VITE_API_BASE_URL=https://api.example.com
VITE_SOCKET_URL=https://api.example.com
VITE_USE_MOCK_DATA=false
```

`VITE_API_URL` is still supported as a legacy alias. Production should prefer `VITE_API_BASE_URL`.

## Backend

Start in production with:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=<strong secret>
FRONTEND_URL=https://app.example.com
CLIENT_URL=https://app.example.com
CORS_ORIGIN=https://app.example.com
SPOTIFY_CLIENT_ID=<from Spotify dashboard>
SPOTIFY_CLIENT_SECRET=<from Spotify dashboard>
SPOTIFY_REDIRECT_URI=https://api.example.com/api/auth/spotify/callback
CACHE_DRIVER=memory
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

`SESSION_SECRET`, Spotify credentials, and database credentials must never be committed.

## CORS And Cookies

Set `FRONTEND_URL`, `CLIENT_URL`, and `CORS_ORIGIN` to the deployed frontend origin. `CORS_ORIGIN` also accepts a comma-separated allowlist if a private beta needs more than one frontend origin. The backend allows Electron's `null` origin for packaged desktop support.

In production, Express session cookies use `secure: true`, `httpOnly: true`, and `sameSite: lax`.

## Database

MongoDB is required. Mongoose creates declared indexes at runtime. No demo data is required for production; pages should handle empty listening history.

## Spotify

Configure the Spotify developer dashboard with the exact production redirect URI:

```text
https://api.example.com/api/auth/spotify/callback
```

For local development:

```text
http://localhost:5000/api/auth/spotify/callback
```

## Electron

Build the frontend before packaging Electron. Then from `desktop-client`:

```powershell
npm run build:unpacked
npm run build:installer
```

Runtime Electron env:

```text
BEATLY_API_BASE_URL=https://api.example.com
BEATLY_SOCKET_URL=https://api.example.com
BEATLY_ENABLE_AUTO_UPDATE=false
```

## Verification

- `frontend`: lint, test, build.
- `backend`: tests and health route.
- `desktop-client`: unpacked build, installer build, packaged launch smoke.
