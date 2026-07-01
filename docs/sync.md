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
