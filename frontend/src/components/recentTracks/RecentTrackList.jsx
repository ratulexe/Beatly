import React from 'react';
import TrackCard from './TrackCard';
import TrackSkeleton from './TrackSkeleton';

const RecentTrackList = ({ tracks, isLoading }) => {
  if (isLoading) {
    return (
      <div className="track-list">
        {Array.from({ length: 10 }).map((_, i) => (
          <TrackSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No recently played tracks found.</p>
        <p style={{ fontSize: '0.85rem', color: '#888' }}>
          Try syncing your Spotify history or listening to some music first!
        </p>
      </div>
    );
  }

  return (
    <div className="track-list">
      {tracks.map((item, index) => (
        <TrackCard key={`${item._id || index}`} item={item} />
      ))}
    </div>
  );
};

const styles = {
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    color: '#ccc'
  }
};

export default RecentTrackList;
