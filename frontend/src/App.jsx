import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ui/ErrorBoundary';
import OfflineNotification from './components/ui/OfflineNotification';
import { SyncProvider } from './context/SyncContext';

function App() {
  return (
    <ErrorBoundary>
      <SyncProvider>
        <OfflineNotification />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '16px',
              padding: '12px 24px',
              fontWeight: 'bold'
            },
            success: {
              iconTheme: {
                primary: '#1DB954',
                secondary: '#fff',
              },
            },
          }}
        />
        {navigator.userAgent.includes('Electron') ? (
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        ) : (
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        )}
      </SyncProvider>
    </ErrorBoundary>
  );
}

export default App;
