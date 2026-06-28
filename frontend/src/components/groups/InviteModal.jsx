import React, { useState } from 'react';
import { X, Search, Check, Send } from 'lucide-react';

const InviteModal = ({ isOpen, onClose, groupId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Mock friends data
  const friends = [
    { id: '1', name: 'Alice Smith', username: '@alice' },
    { id: '2', name: 'Bob Jones', username: '@bobby' },
    { id: '3', name: 'Charlie Brown', username: '@charlie' },
  ].filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleFriend = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSendInvites = () => {
    // Implement invite logic here
    console.log('Sending invites to', selectedFriends, 'for group', groupId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-5 border-b border-beatly-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Invite Friends</h2>
          <button onClick={onClose} className="text-beatly-text-muted hover:text-white p-1 rounded-lg hover:bg-beatly-surface">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-beatly-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beatly-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search friends..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-beatly-surface border border-beatly-border text-white placeholder-beatly-text-muted text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-beatly-primary transition-colors font-semibold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {friends.length === 0 ? (
            <div className="p-8 text-center text-beatly-text-muted text-sm font-medium">
              No friends found.
            </div>
          ) : (
            friends.map(friend => (
              <div 
                key={friend.id}
                onClick={() => toggleFriend(friend.id)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-beatly-surface-hover cursor-pointer transition-colors m-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-beatly-primary/20 flex items-center justify-center text-beatly-primary font-bold">
                    {friend.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{friend.name}</h4>
                    <p className="text-xs text-beatly-text-muted">{friend.username}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                  selectedFriends.includes(friend.id) 
                    ? 'bg-beatly-primary border-beatly-primary text-black' 
                    : 'border-beatly-text-muted/50'
                }`}>
                  {selectedFriends.includes(friend.id) && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-beatly-border bg-beatly-surface/30">
          <button 
            onClick={handleSendInvites}
            disabled={selectedFriends.length === 0}
            className="w-full bg-beatly-primary hover:bg-beatly-primary/90 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            Send Invites {selectedFriends.length > 0 && `(${selectedFriends.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
