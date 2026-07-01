import axios from 'axios';
import { get, set } from 'idb-keyval';

const OFFLINE_QUEUE_KEY = 'beatly_offline_mutations';
const electronConfig = typeof window !== 'undefined' ? window.electronAPI?.config : undefined;
export const API_BASE_URL = electronConfig?.apiBaseUrl ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:5000';

export const SOCKET_BASE_URL = electronConfig?.socketUrl ||
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL, // Absolute URL required for Electron file:// execution
  withCredentials: true // Extremely important to send the connect.sid session cookie
});

const getDeviceId = () => localStorage.getItem('beatly_device_id');

const getQueuedMutations = async () => {
  const queued = await get(OFFLINE_QUEUE_KEY);
  return Array.isArray(queued) ? queued : [];
};

const setQueuedMutations = async (mutations) => {
  await set(OFFLINE_QUEUE_KEY, mutations);
  window.dispatchEvent(new CustomEvent('beatly:offline-queue', { detail: { count: mutations.length } }));
};

const shouldQueueMutation = (config = {}) => {
  const method = config.method?.toLowerCase();
  const url = config.url || '';
  return ['post', 'put', 'patch', 'delete'].includes(method) &&
    !url.includes('/api/sync/mutations') &&
    !url.includes('/api/auth/logout');
};

const parseRequestData = (data) => {
  if (!data) return undefined;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

export const getPendingMutationCount = async () => {
  const queued = await getQueuedMutations();
  return queued.length;
};

export const queueOfflineMutation = async (config) => {
  const queued = await getQueuedMutations();
  const mutationId = config.headers?.['x-idempotency-key'] || crypto.randomUUID();
  if (queued.some((item) => item.mutationId === mutationId)) return queued.length;

  const mutation = {
    mutationId,
    type: 'api_request',
    action: config.url,
    clientTimestamp: new Date().toISOString(),
    payload: {
      method: config.method,
      url: config.url,
      data: parseRequestData(config.data)
    }
  };

  queued.push(mutation);
  await setQueuedMutations(queued);
  return queued.length;
};

export const flushOfflineMutations = async () => {
  const deviceId = getDeviceId();
  const queued = await getQueuedMutations();
  if (!deviceId || queued.length === 0) return { flushed: 0, pending: queued.length };

  const response = await api.post('/api/sync/mutations', {
    deviceId,
    mutations: queued
  });

  await setQueuedMutations([]);
  return { flushed: queued.length, pending: 0, response };
};

// Add idempotency key to mutations
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    if (!config.headers['x-idempotency-key']) {
      config.headers['x-idempotency-key'] = crypto.randomUUID();
    }
    const deviceId = getDeviceId();
    if (deviceId && !config.headers['x-device-id']) {
      config.headers['x-device-id'] = deviceId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (shouldQueueMutation(error.config) && (!error.response || navigator.onLine === false)) {
      await queueOfflineMutation(error.config);
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
