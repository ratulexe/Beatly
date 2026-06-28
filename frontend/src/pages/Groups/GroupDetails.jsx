import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Settings, UserPlus, Music } from 'lucide-react';
import MemberCard from '../../components/groups/MemberCard';
import InviteModal from '../../components/groups/InviteModal';

// Mock Data
const MOCK_GROUP = {
  id: '1',
  name: 'Rock Enthusiasts',
  description: 'A place for classic and modern rock lovers to share tracks and playlists. Let\'s keep the rock spirit alive!',
  memberCount: 156,
  role: 'admin',
  members: [
    { id: '1', name: 'John Doe', role: 'admin', joinedAt: '2 days ago' },
    { id: '2', name: 'Alice Smith', role: 'member', joinedAt: '1 week ago' },
    { id: '3', name: 'Bob Jones', role: 'member', joinedAt: '1 month ago' },
  ]
};

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState(MOCK_GROUP.members);

  const isAdmin = MOCK_GROUP.role === 'admin';

  const handleRemoveMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/groups')}
        className="flex items-center gap-2 text-beatly-text-muted hover:text-white transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Groups
      </button>

      {/* Header Banner */}
      <div className="relative h-48 sm:h-64 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden shadow-2xl border border-beatly-border">
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-beatly-primary via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-beatly-primary flex items-center justify-center text-black font-extrabold text-4xl shadow-lg border-4 border-[#121212]">
              {MOCK_GROUP.name.charAt(0)}
            </div>
            <div className="mb-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{MOCK_GROUP.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-beatly-text-muted">
                <span className="flex items-center gap-1.5"><Users size={16} /> {MOCK_GROUP.memberCount} Members</span>
                <span className="bg-beatly-surface px-2 py-0.5 rounded text-white">{isAdmin ? 'Admin' : 'Member'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 backdrop-blur-md"
            >
              <UserPlus size={18} />
              Invite
            </button>
            {isAdmin && (
              <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors backdrop-blur-md">
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-beatly-border px-6">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'feed' ? 'border-beatly-primary text-beatly-primary' : 'border-transparent text-beatly-text-muted hover:text-white'}`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-4 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'members' ? 'border-beatly-primary text-beatly-primary' : 'border-transparent text-beatly-text-muted hover:text-white'}`}
          >
            Members
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-4 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'about' ? 'border-beatly-primary text-beatly-primary' : 'border-transparent text-beatly-text-muted hover:text-white'}`}
          >
            About
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 min-h-[300px]">
          {activeTab === 'feed' && (
            <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-10">
              <div className="w-16 h-16 bg-beatly-surface rounded-full flex items-center justify-center">
                <Music className="text-beatly-text-muted" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">No activity yet</h3>
                <p className="text-beatly-text-muted max-w-sm">Share a track, playlist, or start a discussion with the group.</p>
              </div>
              <button className="mt-4 bg-beatly-surface-hover hover:bg-beatly-surface text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                New Post
              </button>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">All Members ({members.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map(member => (
                  <MemberCard 
                    key={member.id} 
                    member={member} 
                    isAdmin={isAdmin} 
                    onRemove={handleRemoveMember} 
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Description</h3>
              <p className="text-beatly-text-muted leading-relaxed whitespace-pre-wrap">
                {MOCK_GROUP.description}
              </p>
              
              <div className="mt-8 pt-8 border-t border-beatly-border">
                <h3 className="text-lg font-bold text-white mb-4">Group Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-beatly-surface">
                    <span className="text-beatly-text-muted font-medium">Created</span>
                    <span className="text-white font-semibold">Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-beatly-surface">
                    <span className="text-beatly-text-muted font-medium">Privacy</span>
                    <span className="text-white font-semibold">Public</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        groupId={id} 
      />
    </div>
  );
};

export default GroupDetails;
