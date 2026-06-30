import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { api } from './services/apiClient';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

// Register PWA service worker
registerSW({ immediate: true });

// We must provide a default mutation function so that when onlineManager resumes, it knows how to execute paused mutations
const defaultMutationFn = async ({ method, url, data }) => {
  const response = await api({ method, url, data });
  return response;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      mutationFn: defaultMutationFn,
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  },
});

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});
// Force redirect from localhost to 127.0.0.1 to ensure cookies work seamlessly
if (window.location.hostname === 'localhost') {
  window.location.href = window.location.href.replace('localhost', '127.0.0.1');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries({ refetchType: 'active' });
        });
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
