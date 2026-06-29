import React, { useState } from 'react';
import { X, Search, Check, Send } from 'lucide-react';
import { useFriends } from '../../hooks/useFriends';
import { invitationApi } from '../../services/api/invitationApi';

const InviteModal = ({ isOpen, onClose, groupId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { friends, loading } = useFriends();

  const filteredFriends = friends?.filter(f => {
    const name = f.displayName || f.name || '';
    const username = f.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           username.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const toggleFriend = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleSendInvites = async () => {
    try {
      setIsSending(true);
      await Promise.all(
        selectedFriends.map(friendId => invitationApi.sendInvitation(friendId, groupId))
      );
      onClose();
      // Reset state for next time
      setSelectedFriends([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to send invites:', error);
      // In a real app, show a toast notification here
    } finally {
      setIsSending(false);
    }
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
          {loading ? (
            <div className="p-8 text-center text-beatly-text-muted text-sm font-medium">
              Loading friends...
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-8 text-center text-beatly-text-muted text-sm font-medium">
              No friends found.
            </div>
          ) : (
            filteredFriends.map(friend => {
              const name = friend.displayName || friend.name || 'Unknown';
              const profileImg = friend.profileImage;
              return (
                <div 
                  key={friend._id}
                  onClick={() => toggleFriend(friend._id)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-beatly-surface-hover cursor-pointer transition-colors m-1"
                >
                  <div className="flex items-center gap-3">
                    {profileImg ? (
                      <img src={profileImg} alt={name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-beatly-primary/20 flex items-center justify-center text-beatly-primary font-bold">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">{name}</h4>
                      {/* For now we don't have a specific username field populated everywhere, but if present we display it */}
                      {(friend.username || friend.spotifyId) && (
                        <p className="text-xs text-beatly-text-muted">{friend.username || friend.spotifyId}</p>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    selectedFriends.includes(friend._id) 
                      ? 'bg-beatly-primary border-beatly-primary text-black' 
                      : 'border-beatly-text-muted/50'
                  }`}>
                    {selectedFriends.includes(friend._id) && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-beatly-border bg-beatly-surface/30">
          <button 
            onClick={handleSendInvites}
            disabled={selectedFriends.length === 0 || isSending}
            className="w-full bg-beatly-primary hover:bg-beatly-primary/90 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {isSending ? 'Sending...' : `Send Invites ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
