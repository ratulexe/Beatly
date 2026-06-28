import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-beatly-error/10 border border-beatly-error/20 rounded-2xl">
      <div className="w-12 h-12 bg-beatly-error/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-beatly-error" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      {message && <p className="text-beatly-text-muted mb-6 max-w-md">{message}</p>}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-2 bg-beatly-surface hover:bg-beatly-surface-hover text-white rounded-full transition-colors font-bold"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
