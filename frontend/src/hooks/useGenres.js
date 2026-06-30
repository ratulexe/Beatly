import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useGenres = () => {
  const query = useQuery({
    queryKey: ['analytics', 'genres'],
    queryFn: async () => {
      const { data } = await analyticsApi.getGenres();
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
  return { ...query, isLoading: query.isPending };
};
