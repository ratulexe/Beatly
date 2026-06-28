import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient();

// Force redirect from localhost to 127.0.0.1 to ensure cookies work seamlessly
if (window.location.hostname === 'localhost') {
  window.location.href = window.location.href.replace('localhost', '127.0.0.1');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
