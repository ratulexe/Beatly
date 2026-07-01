# Beatly Sync And Offline Replay

Beatly supports authenticated device registration, targeted sync events, offline mutation persistence, and replay through the backend sync queue.

## Device Registration

The frontend registers each browser or Electron session through:

```text
POST /api/devices/register
```

The backend stores device ownership and the associated Express session ID.

## Offline Queue

The frontend API client queues failed mutations when the browser is offline or the network request cannot reach the backend. Mutations are stored in IndexedDB under `beatly_offline_mutations`.

Each queued mutation includes:

- `mutationId`
- `type`
- `action`
- `clientTimestamp`
- original request method, URL, and data

Duplicate `mutationId` values are suppressed before replay.

## Replay

Queued mutations replay through:

```text
POST /api/sync/mutations
```

The backend verifies:

- authenticated session
- registered device ownership
- valid mutation shape
- idempotency by `mutationId` and user

Unsupported replay work is marked failed and retried with backoff until dead-lettered.

## Remote Logout

Remote logout removes the target device and destroys the target Express session while preserving the current session.

## Socket.IO

Socket.IO uses the same session middleware to authenticate connections. Device and user events are targeted; global broadcast should be avoided for authenticated sync events.

## Automatic Spotify Sync

Production can refresh beta user listening history through a protected cron endpoint:

```text
POST /api/internal/sync/auto
```

The endpoint requires:

```text
Authorization: Bearer <AUTO_SYNC_SECRET>
```

The auto-sync job reuses the existing Spotify recently played sync service and ListeningHistory duplicate prevention. It skips users who are inactive, explicitly disabled for auto sync, missing Spotify refresh tokens, or already syncing. One user failure does not stop the rest of the batch.

Required backend environment variables:

```text
AUTO_SYNC_ENABLED=true
AUTO_SYNC_INTERVAL_MINUTES=15
AUTO_SYNC_BATCH_SIZE=10
AUTO_SYNC_SECRET=<generated secret stored only in Render and the cron provider>
```

For cron-job.org, schedule a `POST` request every 15 minutes to:

```text
https://beatly-backend.onrender.com/api/internal/sync/auto
```

Do not commit the real `AUTO_SYNC_SECRET`.

## App-Open Sync And Freshness UI

The frontend can check Spotify freshness when an authenticated user opens Beatly. If the backend reports stale, failed, or never-synced listening data, the app starts a background Spotify sync without blocking page rendering.

Frontend environment variables:

```text
VITE_AUTO_SYNC_ON_APP_OPEN=true
VITE_AUTO_SYNC_STALE_MINUTES=15
```

Freshness state is read from:

```text
GET /api/sync/status
```

The UI shows a small freshness badge on Dashboard, Recently Played, Analytics, and Settings.
