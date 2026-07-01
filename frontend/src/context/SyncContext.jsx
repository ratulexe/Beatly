import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, flushOfflineMutations, getPendingMutationCount, SOCKET_BASE_URL } from '../services/apiClient';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const socketRef = useRef(null);
  const [deviceId, setDeviceId] = useState(localStorage.getItem('beatly_device_id'));
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshPending = async () => {
      setPendingSyncs(await getPendingMutationCount());
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        await flushOfflineMutations();
        await queryClient.invalidateQueries();
        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Offline queue replay failed', error);
      } finally {
        await refreshPending();
        setIsSyncing(false);
      }
    };
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = (event) => setPendingSyncs(event.detail?.count || 0);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beatly:offline-queue', handleQueueChange);
    refreshPending();
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beatly:offline-queue', handleQueueChange);
    };
  }, [queryClient]);

  useEffect(() => {
    // If not online or no token, don't connect
    if (!isOnline) return;
    let isActive = true;
    let socket;

    // Beatly uses cookies for auth, so we don't need to check localStorage for a token
    // If the API calls fail with 401, they'll be caught below

    const connectSocket = async () => {
      const { io } = await import('socket.io-client');
      if (!isActive) return;

      socket = io(SOCKET_BASE_URL, {
        path: '/socket.io',
        withCredentials: true
      });
      socketRef.current = socket;

      socket.on('connect', async () => {
        setIsConnected(true);

        // Register device
        try {
          if (!deviceId) {
            const res = await api.post('/api/devices/register', {
              deviceName: navigator.userAgent.includes('Electron') ? 'Beatly Desktop' : 'Beatly Web',
              deviceType: navigator.userAgent.includes('Electron') ? 'desktop' : 'web',
              platform: navigator.userAgent.includes('Electron') ? 'Electron' : 'Web',
              browser: navigator.userAgent,
            });
            setDeviceId(res.device._id);
            localStorage.setItem('beatly_device_id', res.device._id);
            socket.emit('register_device', { deviceId: res.device._id });
          } else {
            socket.emit('register_device', { deviceId });
          }
        } catch (err) {
          console.error('Failed to register device', err);
        }
      });

      socket.on('device_not_found', async () => {
        // Device was deleted from backend but still in local storage, so we must re-register
        localStorage.removeItem('beatly_device_id');
        setDeviceId(null); // Clear local state

        try {
          const res = await api.post('/api/devices/register', {
            deviceName: navigator.userAgent.includes('Electron') ? 'Beatly Desktop' : 'Beatly Web',
            deviceType: navigator.userAgent.includes('Electron') ? 'desktop' : 'web',
            platform: navigator.userAgent.includes('Electron') ? 'Electron' : 'Web',
            browser: navigator.userAgent,
          });
          setDeviceId(res.device._id);
          localStorage.setItem('beatly_device_id', res.device._id);
          socket.emit('register_device', { deviceId: res.device._id });

          // Reload to ensure all components fetch the fresh device ID
          window.location.reload();
        } catch (err) {
          console.error('Failed to re-register device', err);
        }
      });

      socket.on('sync_event', (data) => {
        setIsSyncing(true);

        // Real-Time Sync: Silently refetch targeted active queries in the background
        if (data.eventType?.includes('device')) {
          queryClient.invalidateQueries({ queryKey: ['devices'] });
        } else if (data.eventType?.includes('friend')) {
          queryClient.invalidateQueries({ queryKey: ['friends'] });
        } else if (data.eventType?.includes('group')) {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
        } else {
          // Fallback for full sync
          queryClient.invalidateQueries({ refetchType: 'active' });
        }

        setTimeout(() => {
          setIsSyncing(false);
          setLastSyncTime(new Date());
        }, 1000);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });

      socket.on('force_logout', async () => {
        // User was logged out remotely (via another device revoking this session)
        localStorage.removeItem('beatly_device_id');
        try {
          await api.post('/api/auth/logout');
        } catch (e) {
          console.error('Logout API failed but redirecting anyway', e);
        }
        if (navigator.userAgent.includes('Electron')) {
          window.dispatchEvent(new Event('force_logout'));
        } else {
          window.location.href = '/login';
        }
      });
    };

    connectSocket();

    return () => {
      isActive = false;
      if (socket) socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [isOnline, deviceId]);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/api/sync');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Manual sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, isConnected, isSyncing, lastSyncTime, triggerSync, deviceId, pendingSyncs }}>
      {children}
    </SyncContext.Provider>
  );
};
