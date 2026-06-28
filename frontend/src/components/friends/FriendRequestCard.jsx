import React from 'react';
import { User, Check, X } from 'lucide-react';

const FriendRequestCard = ({ request, type = 'incoming', onAccept, onDecline, onCancel }) => {
  return (
    <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-beatly-primary">
      <div className="flex items-center gap-4">
        {request.profileImage ? (
          <img src={request.profileImage} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-beatly-surface-hover flex items-center justify-center text-beatly-text-muted">
            <User size={24} />
          </div>
        )}
        <div>
          <h3 className="text-white font-bold text-base">{request.name}</h3>
          <p className="text-beatly-text-muted text-xs">
            {type === 'incoming' ? 'Sent you a friend request' : 'Friend request sent'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {type === 'incoming' ? (
          <>
            <button 
              onClick={() => onAccept(request.id)}
              className="p-2 bg-beatly-primary/10 text-beatly-primary hover:bg-beatly-primary hover:text-black rounded-xl transition-colors font-bold text-sm flex items-center gap-1"
            >
              <Check size={16} />
              <span className="hidden sm:inline">Accept</span>
            </button>
            <button 
              onClick={() => onDecline(request.id)}
              className="p-2 bg-beatly-surface-hover text-beatly-text-muted hover:text-white hover:bg-beatly-surface rounded-xl transition-colors font-bold text-sm flex items-center gap-1"
            >
              <X size={16} />
              <span className="hidden sm:inline">Decline</span>
            </button>
          </>
        ) : (
          <button 
            onClick={() => onCancel(request.id)}
            className="px-3 py-2 bg-beatly-surface-hover text-beatly-text-muted hover:text-white hover:bg-beatly-surface rounded-xl transition-colors font-bold text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestCard;
