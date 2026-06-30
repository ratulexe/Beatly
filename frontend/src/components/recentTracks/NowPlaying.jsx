import React, { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const NowPlaying = ({ data }) => {
  if (!data || !data.track) return null;

  const { track, isPlaying } = data;
  
  const [localProgress, setLocalProgress] = useState(track.progressMs || 0);
  const lastTrackRef = useRef(track.spotifyTrackId);

  // Reset local progress when API data updates or track changes
  useEffect(() => {
    setLocalProgress(track.progressMs || 0);
    lastTrackRef.current = track.spotifyTrackId;
  }, [track.progressMs, track.spotifyTrackId]);

  // Tick every second while playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setLocalProgress(prev => {
        const next = prev + 1000;
        return next > track.durationMs ? track.durationMs : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, track.durationMs]);

  const progressPercent = track.durationMs > 0 
    ? Math.min((localProgress / track.durationMs) * 100, 100) 
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.liveIndicator}>
          <span style={{
            ...styles.dot,
            animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
            background: isPlaying ? '#1DB954' : '#888'
          }} />
          <span style={{ color: isPlaying ? '#1DB954' : '#888', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isPlaying ? 'Now Playing' : 'Paused'}
          </span>
        </div>
      </div>

      <div style={styles.body}>
        {track.album?.image ? (
          <img loading="lazy" src={track.album.image}
            alt={track.album?.name || 'Album art'}
            style={styles.albumArt}
          />
        ) : (
          <div style={styles.albumArtFallback}>
            <Music size={28} />
          </div>
        )}
        <div style={styles.info}>
          <h3 style={styles.trackName}>{track.name}</h3>
          <p style={styles.artistName}>
            {track.artists?.map(a => a.name).join(', ')} • {track.album?.name}
          </p>
          
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ 
                ...styles.progressFill, 
                width: `${progressPercent}%`,
                background: isPlaying ? '#1DB954' : '#888'
              }} />
            </div>
            <div style={styles.timeContainer}>
              <span style={styles.time}>{formatDuration(localProgress)}</span>
              <span style={styles.time}>{formatDuration(track.durationMs)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.15) 0%, rgba(29, 185, 84, 0.05) 100%)',
    border: '1px solid rgba(29, 185, 84, 0.2)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  header: {
    marginBottom: '12px',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  body: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  albumArt: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  albumArtFallback: {
    width: '72px',
    height: '72px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  info: {
    flex: 1,
    overflow: 'hidden',
  },
  trackName: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artistName: {
    margin: '4px 0 10px 0',
    fontSize: '0.85rem',
    color: '#aaa',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 1s linear',
  },
  timeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  time: {
    fontSize: '0.7rem',
    color: '#888',
  }
};

export default NowPlaying;
