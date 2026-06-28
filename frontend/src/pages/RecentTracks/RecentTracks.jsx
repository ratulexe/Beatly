import React, { useState } from 'react';
import { useRecentTracks } from '../../hooks/useRecentTracks';
import { useSyncTracks } from '../../hooks/useSyncTracks';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import TrackFilters from '../../components/recentTracks/TrackFilters';
import RecentTrackList from '../../components/recentTracks/RecentTrackList';
import Pagination from '../../components/recentTracks/Pagination';
import NowPlaying from '../../components/recentTracks/NowPlaying';

const RecentTracks = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: recentData, isLoading: isRecentLoading, isError, error } = useRecentTracks(page, limit);
  const syncMutation = useSyncTracks();
  const { data: nowPlayingData } = useNowPlaying();

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: () => {
        // Reset to page 1 to see the newest tracks
        setPage(1);
      }
    });
  };

  const tracks = recentData?.data?.items || [];
  const totalPages = recentData?.data?.totalPages || 1;

  if (isError) {
    return (
      <div style={styles.container}>
        <div className="glass-panel" style={{ padding: '20px', color: '#ff4b4b' }}>
          <h3>Error loading tracks</h3>
          <p>{error.message || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <NowPlaying data={nowPlayingData} />

      <TrackFilters 
        onSync={handleSync}
        isSyncing={syncMutation.isPending}
        syncSummary={syncMutation.data?.data}
      />
      
      {syncMutation.isError && (
        <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', color: '#ff4b4b', borderRadius: '8px', marginBottom: '20px' }}>
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
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  }
};

export default RecentTracks;
