import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const SessionCard = ({ session, onRevoke, isCurrent }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center transition-all hover:border-gray-600">
      <div className="flex items-center gap-4">
        <div className="bg-gray-700 p-3 rounded-lg text-primary">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-white flex items-center gap-2">
            Session • {session.platform} {session.browser}
            {isCurrent && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                Current Session
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
            Started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {!isCurrent && (
        <button
          onClick={() => onRevoke(session.sessionId)}
          className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors border border-red-400/20"
        >
          Revoke
        </button>
      )}
    </div>
  );
};

export default SessionCard;
