import React from 'react';
import { User, MessageCircle, MoreVertical } from 'lucide-react';

const FriendCard = ({ friend }) => {
  const name = friend.displayName || friend.name || 'Unknown User';
  const status = friend.status || 'online'; // Default to online for now

  return (
    <div className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:border-beatly-border-hover transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative">
          {friend.profileImage ? (
            <img loading="lazy" src={friend.profileImage} alt={name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-white font-bold text-lg">
              {name.charAt(0)}
            </div>
          )}
          {status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-base">{name}</h3>
          <p className="text-beatly-text-muted text-xs">{status === 'online' ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 bg-beatly-surface-hover hover:bg-beatly-primary hover:text-black text-white rounded-full transition-colors shadow-sm" title="Message">
          <MessageCircle size={16} />
        </button>
        <button className="p-2 text-beatly-text-muted hover:text-white rounded-full hover:bg-beatly-surface-hover transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default FriendCard;
