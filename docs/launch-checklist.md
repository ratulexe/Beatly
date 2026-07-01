# Beatly Launch Checklist

## Code And Tests

- [x] Frontend lint passes.
- [x] Frontend tests pass.
- [x] Frontend production build passes.
- [x] Backend tests pass.
- [x] Electron unpacked build passes.
- [x] Electron NSIS installer build passes.

## Deployment

- [ ] Production MongoDB URI configured.
- [ ] Strong production `SESSION_SECRET` configured.
- [ ] `FRONTEND_URL` and `CLIENT_URL` set to deployed frontend.
- [ ] Spotify production redirect URI added to Spotify dashboard.
- [ ] Backend health route verified after deploy.
- [ ] Protected API returns 401/403 when unauthenticated.
- [ ] Static frontend deploy serves lazy chunks correctly.
- [ ] Socket.IO works from deployed frontend.

## Electron

- [x] Active Electron app confirmed as `desktop-client`.
- [x] Secure preload and sandbox settings verified.
- [x] Unpacked app launches.
- [x] Installer builds.
- [ ] Windows code signing certificate added.
- [ ] Installer signature verified.
- [ ] Auto-update publish provider configured.
- [ ] Packaged Spotify login tested end to end.

## Demo

- [ ] Test Spotify account ready.
- [ ] MongoDB has enough real listening data for demo.
- [ ] Ollama running if AI demo is planned.
- [ ] Browser demo path rehearsed.
- [ ] Electron demo path rehearsed.

## Release Decision

Do not mark public launch ready until production deploy, OAuth callback, Socket.IO, and packaged Electron login have been manually verified.
