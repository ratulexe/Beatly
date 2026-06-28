import React from 'react';

const TrackSkeleton = () => {
  return (
    <div className="track-card glass-panel" style={styles.card}>
      <div style={styles.imageSkeleton} className="animate-pulse" />
      <div style={styles.info}>
        <div style={styles.titleSkeleton} className="animate-pulse" />
        <div style={styles.subtitleSkeleton} className="animate-pulse" />
      </div>
      <div style={styles.meta}>
        <div style={styles.metaSkeleton} className="animate-pulse" />
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  imageSkeleton: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    marginRight: '16px',
  },
  info: {
    flex: 1,
  },
  titleSkeleton: {
    height: '16px',
    width: '60%',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  subtitleSkeleton: {
    height: '12px',
    width: '40%',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  },
  meta: {
    marginLeft: '16px',
  },
  metaSkeleton: {
    height: '12px',
    width: '50px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  }
};

export default TrackSkeleton;
