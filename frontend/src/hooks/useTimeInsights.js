import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api/analyticsApi';

export const useTimeInsights = () => {
  const query = useQuery({
    queryKey: ['analytics', 'timeInsights'],
    queryFn: async () => {
      const { data } = await analyticsApi.getTimeInsights();
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
  return { ...query, isLoading: query.isPending };
};
