import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useTopArtists = () => {
  return useQuery({
    queryKey: ['analytics', 'topArtists'],
    queryFn: async () => {
      const { data } = await analyticsApi.getTopArtists();
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
};
