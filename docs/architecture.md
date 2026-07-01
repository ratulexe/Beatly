# Beatly Architecture

Beatly is a Spotify analytics app with a React frontend, Express backend, MongoDB persistence, optional Ollama AI features, and an Electron desktop shell.

## Applications

- `frontend`: Vite + React app. It renders dashboard, analytics, AI, sync, leaderboard, wrapped, and settings pages.
- `backend`: Express API server. It owns auth, Spotify API integration, analytics aggregation, sync replay, device/session ownership, AI orchestration, and health checks.
- `desktop-client`: Electron shell. It packages the production frontend and talks to the same backend API.

## Data Flow

1. User signs in with Spotify OAuth through the backend.
2. Backend stores only the session user ID in the Express session.
3. Spotify profile/listening data is synced into MongoDB.
4. Frontend reads production data through authenticated API calls.
5. Offline-capable frontend mutations are queued locally and replayed through `/api/sync/mutations`.
6. Socket.IO broadcasts targeted sync/device events to authenticated user/device rooms.

## Key Boundaries

- Spotify secrets stay on the backend.
- Electron exposes only allowlisted preload APIs.
- Frontend production pages should use real API data by default.
- Development-only mock data must be behind `VITE_USE_MOCK_DATA=true`.

## Production Assumptions

- MongoDB is required.
- Spotify OAuth credentials are required for login.
- Ollama is optional for AI quality, but AI routes should fail gracefully if the local AI provider is unavailable.
- Electron currently assumes a reachable Beatly backend URL configured by env or local default.
