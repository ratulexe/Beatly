import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useTimeInsights = () => {
  return useQuery({
    queryKey: ['analytics', 'timeInsights'],
    queryFn: async () => {
      const { data } = await analyticsApi.getTimeInsights();
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
};
