import { useQuery } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';

export const SPOTIFY_SYNC_STATUS_QUERY_KEY = ['spotifySyncStatus'];

export const useSpotifySyncStatus = () => useQuery({
  queryKey: SPOTIFY_SYNC_STATUS_QUERY_KEY,
  queryFn: trackApi.getSyncStatus,
  staleTime: 60 * 1000,
  refetchOnWindowFocus: true,
  retry: false
});
