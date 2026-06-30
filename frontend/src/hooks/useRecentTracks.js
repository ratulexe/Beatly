import { useQuery } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';

export const useRecentTracks = (page = 1, limit = 20) => {
  const query = useQuery({
    queryKey: ['recentTracks', page, limit],
    queryFn: () => trackApi.getRecentTracks(page, limit),
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    keepPreviousData: true, // Helps with smooth pagination
    retry: 1, // Only retry once
    refetchOnWindowFocus: false,
  });
  return { ...query, isLoading: query.isPending };
};
