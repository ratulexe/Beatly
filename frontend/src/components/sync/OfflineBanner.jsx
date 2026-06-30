import React from 'react';
import { useSync } from '../../context/SyncContext';

const OfflineBanner = () => {
  const { isOnline, pendingSyncs } = useSync();

  if (isOnline) return null;

  return (
    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 mb-6 rounded-r-md flex justify-between items-center">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
          </svg>
          You are offline
        </h3>
        <p className="text-sm mt-1 opacity-90">
          {pendingSyncs > 0 
            ? `${pendingSyncs} changes waiting to sync when you reconnect.` 
            : 'Changes will be saved locally and synced when you reconnect.'}
        </p>
      </div>
    </div>
  );
};

export default OfflineBanner;
