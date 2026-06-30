import React, { useState } from 'react';
import { useRecentTracks } from '../../hooks/useRecentTracks';
import { useSyncTracks } from '../../hooks/useSyncTracks';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import TrackFilters from '../../components/recentTracks/TrackFilters';
import RecentTrackList from '../../components/recentTracks/RecentTrackList';
import Pagination from '../../components/recentTracks/Pagination';
import NowPlaying from '../../components/recentTracks/NowPlaying';
import { Clock } from 'lucide-react';

export default function RecentTracks() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: recentData, isLoading: isRecentLoading, isError, error } = useRecentTracks(page, limit);
  const syncMutation = useSyncTracks();
  const { data: nowPlayingData } = useNowPlaying();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: () => {
        setPage(1);
      }
    });
  };

  const tracks = recentData?.items || [];
  const totalPages = recentData?.totalPages || 1;

  if (isError) {
    return (
      <div className="p-8 text-center bg-beatly-error/10 border border-beatly-error/20 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Error loading tracks</h3>
        <p className="text-beatly-error">{error.message || 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center">
          <Clock size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Recent Tracks</h1>
          <p className="text-beatly-text-muted font-semibold">Your Spotify listening history</p>
        </div>
      </div>

      <NowPlaying data={nowPlayingData} />

      <TrackFilters 
        onSync={handleSync}
        isSyncing={syncMutation.isPending}
        syncSummary={syncMutation.data}
      />
      
      {syncMutation.isError && (
        <div className="p-4 bg-beatly-error/10 text-beatly-error rounded-xl font-bold">
          Failed to sync: {syncMutation.error.message}
        </div>
      )}

      <RecentTrackList 
        tracks={tracks} 
        isLoading={isRecentLoading} 
      />

      {tracks.length > 0 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
}
