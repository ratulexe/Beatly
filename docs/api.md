# Beatly API Overview

The backend is an Express API. Most product routes require an authenticated Spotify session.

## Health

- `GET /api/health`: simple OK check.
- `GET /api/health/status`: detailed app/dependency status.
- `GET /api/health/metrics`: runtime metrics.

## Auth

- `GET /api/auth/login`: starts Spotify OAuth.
- `GET /api/auth/callback`: handles Spotify OAuth callback.
- `POST /api/auth/logout`: destroys current session.
- `GET /api/auth/status`: returns current session authentication status.

## Analytics And Spotify Data

- `GET /api/analytics/overview`
- `GET /api/analytics/daily`
- `GET /api/analytics/top-artists`
- `GET /api/analytics/top-tracks`
- `GET /api/analytics/top-albums`
- `GET /api/analytics/genres`
- `GET /api/analytics/time-insights`
- `GET /api/tracks/recent`
- `PATCH /api/tracks/sync`
- `GET /api/tracks/now-playing`

## Sync And Devices

- `POST /api/sync/mutations`: authenticated offline mutation replay endpoint.
- `POST /api/sync`: trigger incremental sync event.
- `POST /api/sync/full`: trigger full sync event.
- `GET /api/devices`: list current user's devices.
- `POST /api/devices/register`: register current device/session.
- `PATCH /api/devices/:id`: update allowlisted device fields.
- `DELETE /api/devices/:id`: delete own device and revoke its session.
- `GET /api/session/devices`: list session devices.
- `POST /api/session/logout-device`: remote logout by owned session ID.

## AI, Coach, Discover, Wrapped, Ranking

Routes under `/api/ai`, `/api/coach`, `/api/discover`, `/api/wrapped`, `/api/leaderboards`, `/api/achievements`, `/api/groups`, `/api/friends`, and `/api/invitations` are authenticated product APIs.

## Error Contract

Protected APIs return `401` when no valid session exists and `403` when Spotify is not connected or ownership checks fail. Validation errors return `400` with safe error output.
