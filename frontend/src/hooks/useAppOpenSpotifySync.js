import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';
import { invalidateSpotifyDataQueries } from './useSyncTracks';
import { SPOTIFY_SYNC_STATUS_QUERY_KEY } from './useSpotifySyncStatus';

const AUTO_SYNC_ON_APP_OPEN = import.meta.env.VITE_AUTO_SYNC_ON_APP_OPEN !== 'false';
const DEFAULT_STALE_MINUTES = Number.parseInt(import.meta.env.VITE_AUTO_SYNC_STALE_MINUTES || '15', 10);
const MIN_RETRY_INTERVAL_MS = 60 * 1000;

let syncInFlight = false;
let lastAttemptAt = 0;

const getStaleThresholdMs = () => (
  Number.isInteger(DEFAULT_STALE_MINUTES) && DEFAULT_STALE_MINUTES > 0
    ? DEFAULT_STALE_MINUTES
    : 15
) * 60 * 1000;

const isAuthError = (error) => {
  const code = error?.data?.code || error?.code;
  const message = error?.message || '';
  return code === 'NO_SESSION' || code === 'USER_NOT_FOUND' || /unauthorized|log in/i.test(message);
};

export const shouldRunAppOpenSpotifySync = (status, now = Date.now()) => {
  if (!status || status.isSyncing || status.dataFreshness === 'syncing' || status.dataFreshness === 'fresh') {
    return false;
  }

  if (['failed', 'unknown'].includes(status.dataFreshness)) {
    return true;
  }

  const lastSuccessfulSyncAt = status.lastSuccessfulSyncAt;
  if (!lastSuccessfulSyncAt) {
    return status.dataFreshness === 'stale';
  }

  const ageMs = now - new Date(lastSuccessfulSyncAt).getTime();
  return status.dataFreshness === 'stale' || ageMs > getStaleThresholdMs();
};

export const resetAppOpenSpotifySyncGuardForTests = () => {
  syncInFlight = false;
  lastAttemptAt = 0;
};

export const useAppOpenSpotifySync = ({
  enabled = true,
  onSyncStart,
  onSyncSuccess,
  onSyncFailure,
  onSyncEnd
} = {}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !AUTO_SYNC_ON_APP_OPEN || navigator.onLine === false) return undefined;

    let cancelled = false;

    const run = async () => {
      const now = Date.now();
      if (syncInFlight || now - lastAttemptAt < MIN_RETRY_INTERVAL_MS) return;

      syncInFlight = true;
      lastAttemptAt = now;

      try {
        const status = await queryClient.fetchQuery({
          queryKey: SPOTIFY_SYNC_STATUS_QUERY_KEY,
          queryFn: trackApi.getSyncStatus,
          staleTime: 30 * 1000
        });

        if (cancelled || !shouldRunAppOpenSpotifySync(status, now)) return;

        onSyncStart?.();
        queryClient.setQueryData(SPOTIFY_SYNC_STATUS_QUERY_KEY, (current = status) => ({
          ...current,
          isSyncing: true,
          dataFreshness: 'syncing'
        }));

        const result = await trackApi.syncTracks();
        if (cancelled) return;

        onSyncSuccess?.(result);
        await invalidateSpotifyDataQueries(queryClient);
      } catch (error) {
        if (!isAuthError(error)) {
          onSyncFailure?.(error);
          queryClient.setQueryData(SPOTIFY_SYNC_STATUS_QUERY_KEY, (current = {}) => ({
            ...current,
            isSyncing: false,
            dataFreshness: 'failed',
            lastSyncError: current.lastSyncError || error?.message || 'Spotify sync failed'
          }));
        } else {
          lastAttemptAt = 0;
        }
      } finally {
        syncInFlight = false;
        onSyncEnd?.();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, onSyncEnd, onSyncFailure, onSyncStart, onSyncSuccess, queryClient]);
};
