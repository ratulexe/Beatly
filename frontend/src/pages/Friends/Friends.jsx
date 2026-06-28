import React, { useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import FriendCard from '../../components/friends/FriendCard';

// Mock Data
const MOCK_FRIENDS = [
  { id: '1', name: 'Alice Smith', status: 'online' },
  { id: '2', name: 'Bob Jones', status: 'offline' },
  { id: '3', name: 'Charlie Brown', status: 'online' },
  { id: '4', name: 'Diana Prince', status: 'offline' },
  { id: '5', name: 'Eve Adams', status: 'online' },
];

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, online

  const filteredFriends = MOCK_FRIENDS.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Friends</h1>
          <p className="text-beatly-text-muted">See who's online and manage your connections.</p>
        </div>
        <button className="bg-beatly-primary text-black px-5 py-2.5 rounded-xl font-bold hover:bg-beatly-primary/90 transition-colors flex items-center gap-2">
          <UserPlus size={20} />
          Add Friend
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto bg-beatly-surface p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-beatly-surface-hover text-white' : 'text-beatly-text-muted hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('online')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === 'online' ? 'bg-beatly-surface-hover text-white' : 'text-beatly-text-muted hover:text-white'}`}
          >
            Online
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beatly-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search friends..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-beatly-surface border border-beatly-border text-white placeholder-beatly-text-muted text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-beatly-primary transition-colors font-medium"
          />
        </div>
      </div>

      {filteredFriends.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="w-16 h-16 bg-beatly-surface-hover rounded-full flex items-center justify-center mb-4">
            <Users className="text-beatly-text-muted" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No friends found</h3>
          <p className="text-beatly-text-muted max-w-md">
            {searchQuery ? 'Try a different search term.' : 'You don\'t have any friends matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map(friend => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
