import React from 'react';
import { RefreshCw } from 'lucide-react';

const TrackFilters = ({ onSync, isSyncing, syncSummary }) => {
  return (
    <div style={styles.container} className="glass-panel">
      <div style={styles.left}>
        <h3 style={styles.title}>Recently Played</h3>
        <p style={styles.subtitle}>Your listening history from Spotify</p>
      </div>
      
      <div style={styles.right}>
        {syncSummary && (
          <div style={styles.summary}>
            <span style={{ color: '#1DB954' }}>+{syncSummary.newTracks} new</span>
            <span style={{ color: '#888' }}>({syncSummary.duplicates} skipped)</span>
          </div>
        )}
        
        <button 
          onClick={onSync} 
          disabled={isSyncing}
          style={{ ...styles.button, opacity: isSyncing ? 0.7 : 1 }}
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} style={{ marginRight: '8px' }} />
          {isSyncing ? 'Syncing...' : 'Sync with Spotify'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.9rem',
    color: '#aaa'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    background: '#1DB954',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }
};

export default TrackFilters;
