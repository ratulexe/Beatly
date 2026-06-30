import { beforeEach, describe, expect, it, vi } from 'vitest';

const idb = vi.hoisted(() => ({
  store: new Map(),
}));

vi.mock('idb-keyval', () => ({
  get: vi.fn((key) => Promise.resolve(idb.store.get(key))),
  set: vi.fn((key, value) => {
    idb.store.set(key, value);
    return Promise.resolve();
  }),
}));

const OFFLINE_QUEUE_KEY = 'beatly_offline_mutations';

describe('offline mutation queue', () => {
  beforeEach(() => {
    idb.store.clear();
    localStorage.clear();
    vi.resetModules();
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'generated-mutation-id'),
    });
  });

  it('persists offline mutations and suppresses duplicate idempotency keys', async () => {
    const { getPendingMutationCount, queueOfflineMutation } = await import('../services/apiClient');

    const config = {
      method: 'patch',
      url: '/api/devices/device-1',
      data: JSON.stringify({ deviceName: 'Laptop' }),
      headers: { 'x-idempotency-key': 'same-key' }
    };

    await queueOfflineMutation(config);
    await queueOfflineMutation(config);

    expect(await getPendingMutationCount()).toBe(1);
    expect(idb.store.get(OFFLINE_QUEUE_KEY)).toEqual([
      {
        mutationId: 'same-key',
        type: 'api_request',
        action: '/api/devices/device-1',
        clientTimestamp: expect.any(String),
        payload: {
          method: 'patch',
          url: '/api/devices/device-1',
          data: { deviceName: 'Laptop' }
        }
      }
    ]);
  });

  it('replays queued mutations through /api/sync/mutations and clears the queue', async () => {
    const { api, flushOfflineMutations } = await import('../services/apiClient');
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ success: true });

    localStorage.setItem('beatly_device_id', 'device-1');
    idb.store.set(OFFLINE_QUEUE_KEY, [
      {
        mutationId: 'queued-key',
        type: 'api_request',
        action: '/api/devices/device-1',
        clientTimestamp: new Date().toISOString(),
        payload: {
          method: 'patch',
          url: '/api/devices/device-1',
          data: { deviceName: 'Desktop' }
        }
      }
    ]);

    const result = await flushOfflineMutations();

    expect(postSpy).toHaveBeenCalledWith('/api/sync/mutations', {
      deviceId: 'device-1',
      mutations: expect.arrayContaining([
        expect.objectContaining({ mutationId: 'queued-key' })
      ])
    });
    expect(result).toMatchObject({ flushed: 1, pending: 0 });
    expect(idb.store.get(OFFLINE_QUEUE_KEY)).toEqual([]);
  });
});
