import { Clock, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { ProfileCard } from './ProfileCard.jsx';
import { Button } from '../ui/Button.jsx';

export const ProfileInfo = ({ profile, onSync, isSyncing, onLogout, isLoggingOut }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ProfileCard title="Account Details" delay={0.4}>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-gray-400" size={20} />
            <span className="text-gray-300">Connection Status</span>
          </div>
          <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Clock className="text-gray-400" size={20} />
            <span className="text-gray-300">Connected Since</span>
          </div>
          <span className="text-white font-medium">
            {formatDate(profile.connectedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-gray-400" size={20} />
            <span className="text-gray-300">Last Login</span>
          </div>
          <span className="text-white font-medium">
            {formatDate(profile.lastLogin)}
          </span>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={onSync} 
            disabled={isSyncing || isLoggingOut}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex justify-center items-center gap-2"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing with Spotify...' : 'Force Sync Profile'}
          </Button>

          <Button 
            onClick={onLogout} 
            disabled={isLoggingOut || isSyncing}
            className="w-full bg-beatly-error/10 hover:bg-beatly-error/20 text-beatly-error border border-beatly-error/20 flex justify-center items-center gap-2"
          >
            <LogOut size={18} className={isLoggingOut ? 'animate-pulse' : ''} />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </div>
    </ProfileCard>
  );
};
