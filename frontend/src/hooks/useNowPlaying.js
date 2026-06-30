import { useQuery } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';

export const useNowPlaying = () => {
  const query = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: () => trackApi.getNowPlaying(),
    refetchInterval: 30000, // Poll every 30 seconds to avoid rate limits
    staleTime: 25000,
    retry: false, // Don't retry on failure - just wait for next poll
    refetchOnWindowFocus: false,
  });
  return { ...query, isLoading: query.isPending };
};
