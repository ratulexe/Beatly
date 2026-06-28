import { Users, Crown, Globe } from 'lucide-react';
import { ProfileCard } from './ProfileCard.jsx';

export const ProfileStats = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <ProfileCard title="Followers" delay={0.1}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {profile.followers?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard title="Plan" delay={0.2}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <Crown size={24} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white capitalize truncate max-w-[100px] sm:max-w-[120px]">
              {profile.product || 'Free'}
            </div>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard title="Region" delay={0.3}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white uppercase">
              {profile.country || 'N/A'}
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
};
