import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useTopTracks = () => {
  return useQuery({
    queryKey: ['analytics', 'topTracks'],
    queryFn: async () => {
      const { data } = await analyticsApi.getTopTracks();
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
};
