import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api/userApi.js';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    retry: false // Do not retry on 401s
  });

  const syncMutation = useMutation({
    mutationFn: userApi.syncProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: userApi.logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data on logout
      window.location.href = '/login'; // Redirect to login page
    }
  });

  return {
    profile: profileQuery.data?.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    syncProfile: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
};
