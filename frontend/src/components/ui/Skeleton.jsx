import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-beatly-surface-hover rounded-xl ${className}`}></div>
  );
};
