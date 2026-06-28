import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackApi } from '../services/api/trackApi';

export const useSyncTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => trackApi.syncTracks(),
    onSuccess: () => {
      // Invalidate and refetch all queries related to recent tracks
      queryClient.invalidateQueries({ queryKey: ['recentTracks'] });
    }
  });
};
