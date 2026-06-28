import { Clock, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { ProfileCard } from './ProfileCard.jsx';
import { Button } from '../ui/Button.jsx';

import { Link } from 'react-router-dom';

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
          <Link to="/recent">
            <button 
              className="w-full bg-beatly-primary hover:bg-beatly-primary/90 text-black font-bold py-2.5 rounded-xl transition-colors mb-3"
            >
              View Recent Tracks
            </button>
          </Link>

          <button 
            onClick={onSync} 
            disabled={isSyncing || isLoggingOut}
            className="w-full bg-beatly-surface-hover hover:bg-beatly-surface text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 mb-3 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Force Sync Profile'}
          </button>

          <button 
            onClick={onLogout} 
            disabled={isLoggingOut || isSyncing}
            className="w-full bg-beatly-error/10 hover:bg-beatly-error/20 text-beatly-error font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <LogOut size={18} className={isLoggingOut ? 'animate-pulse' : ''} />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </ProfileCard>
  );
};
