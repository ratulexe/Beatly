import React from 'react';
import { useSync } from '../../context/SyncContext';

export const ConnectionStatus = () => {
  const { isOnline, isConnected } = useSync();
  const connected = isOnline && isConnected;

  return (
    <div className={`px-2 py-1 text-xs font-bold rounded-full ${connected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
      {connected ? 'Connected' : isOnline ? 'Reconnecting' : 'Offline'}
    </div>
  );
};
