import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({ title = 'No data available', message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-beatly-border rounded-2xl">
      <div className="w-16 h-16 bg-beatly-surface rounded-full flex items-center justify-center mb-6">
        <Database size={32} className="text-beatly-text-muted" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {message && <p className="text-beatly-text-muted mb-6 max-w-md">{message}</p>}
      {action}
    </div>
  );
};
