import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../../components/groups/GroupCard';

// Mock Data
const MOCK_GROUPS = [
  { id: '1', name: 'Rock Enthusiasts', description: 'A place for classic and modern rock lovers to share tracks and playlists.', memberCount: 156, role: 'admin' },
  { id: '2', name: 'Jazz & Blues Vibes', description: 'Smooth jazz and deep blues. Share your favorite artists and discoveries.', memberCount: 89, role: 'member' },
  { id: '3', name: 'Electronic Dance Crew', description: 'EDM, House, Techno. Let the beat drop!', memberCount: 342, role: 'member' },
];

const Groups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Your Groups</h1>
          <p className="text-beatly-text-muted">Connect with others who share your music taste.</p>
        </div>
        <button 
          onClick={() => navigate('/groups/create')}
          className="bg-beatly-primary text-black px-5 py-2.5 rounded-xl font-bold hover:bg-beatly-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
        <Search className="text-beatly-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Search your groups..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder-beatly-text-muted font-medium"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-2xl">
          <div className="w-16 h-16 bg-beatly-surface-hover rounded-full flex items-center justify-center mb-4">
            <Search className="text-beatly-text-muted" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No groups found</h3>
          <p className="text-beatly-text-muted max-w-md">Try adjusting your search or create a new group to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
