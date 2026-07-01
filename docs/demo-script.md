# Beatly Portfolio Demo Script

## Setup

1. Start MongoDB.
2. Start backend on `http://127.0.0.1:5000`.
3. Start frontend on `http://127.0.0.1:5173`.
4. Confirm Spotify login works with a test Spotify account.
5. Optional: start Ollama for AI features.

## Demo Flow

1. Open Beatly and sign in with Spotify.
2. Show Dashboard with real listening stats.
3. Open Recently Played and run Sync with Spotify.
4. Open Analytics and show time/genre insights.
5. Open Top Artists, Top Albums, and leaderboard/achievements.
6. Open Discover and explain real recommendation data.
7. Open Beatly AI and Coach; mention Ollama powers local AI.
8. Open Wrapped and generate/play a story if data is available.
9. Open Settings to Devices and show current session/device.
10. Mention offline replay and remote logout were tested in Phase 18.
11. Launch packaged Electron app and show the same app shell.

## Talking Points

- Real backend data replaced mock/demo data.
- Offline mutations persist and replay with idempotency.
- Device/session ownership prevents cross-user modification.
- Electron packaging uses secure preload and sandboxed renderer.
- Performance work split heavy routes and removed Vite chunk warnings.

## Fallbacks

- If Spotify has no recent data, show empty states and explain production handles new users.
- If Ollama is unavailable, show AI error/empty states and explain local AI setup.
- If Electron cannot log in during demo, show packaged launch and browser login flow.
