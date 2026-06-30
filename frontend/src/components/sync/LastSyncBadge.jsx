import React from 'react';
import { useSync } from '../../context/SyncContext';
import { formatDistanceToNow } from 'date-fns';

export const LastSyncBadge = ({ lastSyncTime: deviceLastSyncTime }) => {
  const { lastSyncTime } = useSync();
  const displayTime = deviceLastSyncTime || lastSyncTime;

  if (!displayTime) return <span className="text-xs opacity-50">Never synced</span>;

  return (
    <span className="text-xs opacity-50">
      Synced {formatDistanceToNow(new Date(displayTime), { addSuffix: true })}
    </span>
  );
};
export default LastSyncBadge;
