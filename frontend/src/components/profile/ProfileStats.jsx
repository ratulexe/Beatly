import { Users, Crown, Globe } from 'lucide-react';
import { ProfileCard } from './ProfileCard.jsx';

export const ProfileStats = ({ profile }) => {
  return (
    <div className="flex flex-col gap-6">
      <ProfileCard title="Followers" delay={0.1}>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <Users size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg lg:text-xl font-bold text-white break-words">
              {profile.followers?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard title="Plan" delay={0.2}>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
            <Crown size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg lg:text-xl font-bold text-white capitalize break-words">
              {profile.product || 'Free'}
            </div>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard title="Region" delay={0.3}>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <Globe size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg lg:text-xl font-bold text-white uppercase break-words">
              {profile.country || 'N/A'}
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
};
