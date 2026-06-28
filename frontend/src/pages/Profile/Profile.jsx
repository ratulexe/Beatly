import { PageContainer } from '../../components/layout/PageContainer.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { ProfileInfo } from '../../components/profile/ProfileInfo.jsx';
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton.jsx';
import { useProfile } from '../../hooks/useProfile.js';

export default function Profile() {
  const { profile, isLoading, isError, error, syncProfile, isSyncing, logout, isLoggingOut } = useProfile();

  if (isLoading) {
    return (
      <PageContainer>
        <ProfileSkeleton />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto p-8 bg-beatly-error/10 border border-beatly-error/20 rounded-2xl text-center">
          <h2 className="text-xl font-bold text-beatly-error mb-2">Failed to load profile</h2>
          <p className="text-red-200">{error?.message || 'An unexpected error occurred.'}</p>
        </div>
      </PageContainer>
    );
  }

  if (!profile) return null;

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader profile={profile} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileStats profile={profile} />
          </div>
          <div>
            <ProfileInfo 
              profile={profile} 
              onSync={syncProfile} 
              isSyncing={isSyncing} 
              onLogout={logout}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
