import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div style={styles.container}>
      <button 
        style={{ ...styles.button, opacity: page <= 1 ? 0.5 : 1 }}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      
      <span style={styles.text}>Page {page} of {totalPages || 1}</span>
      
      <button 
        style={{ ...styles.button, opacity: page >= totalPages ? 0.5 : 1 }}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '20px',
    padding: '10px'
  },
  button: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  text: {
    color: '#ccc',
    fontSize: '0.9rem',
    fontWeight: '500'
  }
};

export default Pagination;
