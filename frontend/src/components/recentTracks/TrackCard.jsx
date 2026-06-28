import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const TrackCard = ({ item }) => {
  const { trackId: track, playedAt } = item;
  
  if (!track) return null;

  const album = track.albumId;
  const artists = track.artistIds;

  return (
    <div className="track-card glass-panel" style={styles.card}>
      <img 
        src={album?.image || 'https://via.placeholder.com/60'} 
        alt={album?.name || 'Album cover'} 
        style={styles.image}
      />
      <div style={styles.info}>
        <h4 style={styles.title}>{track.name}</h4>
        <p style={styles.subtitle}>
          {artists?.map(a => a.name).join(', ')} • {album?.name}
        </p>
      </div>
      <div style={styles.meta}>
        <span style={styles.playedAt}>{formatDistanceToNow(new Date(playedAt), { addSuffix: true })}</span>
        <span style={styles.duration}>{formatDuration(track.durationMs)}</span>
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
    transition: 'background 0.2s',
    cursor: 'pointer',
  },
  image: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
    marginRight: '16px',
  },
  info: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.85rem',
    color: '#aaa',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: '16px',
    minWidth: '80px',
  },
  playedAt: {
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '4px',
  },
  duration: {
    fontSize: '0.85rem',
    color: '#ccc',
  }
};

export default TrackCard;
