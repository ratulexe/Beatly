import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useDailyStats = (days = 7) => {
  return useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: async () => {
      const { data } = await analyticsApi.getDailyStats(days);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
};
