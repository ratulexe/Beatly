import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';
import { SPOTIFY_SYNC_STATUS_QUERY_KEY } from './useSpotifySyncStatus';

export const invalidateSpotifyDataQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['recentTracks'] }),
    queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    queryClient.invalidateQueries({ queryKey: ['coach'] }),
    queryClient.invalidateQueries({ queryKey: SPOTIFY_SYNC_STATUS_QUERY_KEY })
  ]);
};

export const useSyncTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const syncStatus = queryClient.getQueryData(SPOTIFY_SYNC_STATUS_QUERY_KEY);
      if (syncStatus?.isSyncing) {
        throw new Error('Sync already running');
      }
      queryClient.setQueryData(SPOTIFY_SYNC_STATUS_QUERY_KEY, (current = {}) => ({
        ...current,
        isSyncing: true,
        dataFreshness: 'syncing'
      }));
      return trackApi.syncTracks();
    },
    onSuccess: async () => {
      await invalidateSpotifyDataQueries(queryClient);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: SPOTIFY_SYNC_STATUS_QUERY_KEY });
    }
  });
};
