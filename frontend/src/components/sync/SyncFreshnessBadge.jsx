import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useSpotifySyncStatus } from '../../hooks/useSpotifySyncStatus';

export const formatLastSyncAge = (dateValue) => {
  if (!dateValue) return null;

  const diffMs = Date.now() - new Date(dateValue).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const stateConfig = {
  fresh: {
    icon: CheckCircle2,
    text: 'Listening data is fresh',
    className: 'border-green-400/20 bg-green-400/10 text-green-300'
  },
  syncing: {
    icon: RefreshCw,
    text: 'Syncing Spotify data...',
    className: 'border-blue-400/20 bg-blue-400/10 text-blue-300'
  },
  stale: {
    icon: AlertTriangle,
    text: 'Your listening data may be outdated.',
    className: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-200'
  },
  failed: {
    icon: XCircle,
    text: 'Last Spotify sync failed. You can try manual sync.',
    className: 'border-red-400/20 bg-red-400/10 text-red-200'
  },
  unknown: {
    icon: Clock,
    text: 'Sync Spotify to start tracking your listening history.',
    className: 'border-white/10 bg-white/5 text-beatly-text-muted'
  }
};

const getStatusText = (status) => {
  const state = status?.dataFreshness || 'unknown';
  if (state === 'stale') {
    const age = formatLastSyncAge(status?.lastSuccessfulSyncAt || status?.lastSyncAt);
    return age
      ? `Your listening data may be outdated. Last synced ${age}.`
      : stateConfig.stale.text;
  }

  return stateConfig[state]?.text || stateConfig.unknown.text;
};

export default function SyncFreshnessBadge({ className = '' }) {
  const { data: status, isLoading, isError } = useSpotifySyncStatus();

  if (isLoading || isError) return null;

  const state = status?.dataFreshness || 'unknown';
  const config = stateConfig[state] || stateConfig.unknown;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${config.className} ${className}`}>
      <Icon size={14} className={state === 'syncing' ? 'animate-spin' : ''} />
      <span>{getStatusText(status)}</span>
    </div>
  );
}
