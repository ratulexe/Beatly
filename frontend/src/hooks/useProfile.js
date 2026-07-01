import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api/userApi.js';

const CURRENT_USER_KEY = 'beatly_current_user_id';

const getProfileId = (profile) => profile?._id || profile?.id || profile?.spotifyId || null;

export const useProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: userApi.getProfile,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false // Do not retry on 401s
  });

  useEffect(() => {
    const profileId = getProfileId(profileQuery.data);
    if (!profileId) return;

    const previousProfileId = localStorage.getItem(CURRENT_USER_KEY);
    if (previousProfileId && previousProfileId !== String(profileId)) {
      queryClient.clear();
      queryClient.setQueryData(['userProfile'], profileQuery.data);
    }

    localStorage.setItem(CURRENT_USER_KEY, String(profileId));
  }, [profileQuery.data, queryClient]);

  const syncMutation = useMutation({
    mutationFn: userApi.syncProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: userApi.logout,
    onSuccess: () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      queryClient.clear(); // Clear all cached data on logout
    }
  });

  const isRefreshingProfile = profileQuery.isFetching && !profileQuery.isPending;

  return {
    profile: isRefreshingProfile ? undefined : profileQuery.data,
    isLoading: profileQuery.isPending || isRefreshingProfile,
    isFetching: profileQuery.isFetching,
    isError: profileQuery.isError,
    error: profileQuery.error,
    syncProfile: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
};
