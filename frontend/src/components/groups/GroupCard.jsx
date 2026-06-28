import React from 'react';
import { Users, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4 hover:border-beatly-primary/50 transition-all cursor-pointer group"
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-beatly-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {group.name.charAt(0)}
        </div>
        <button 
          className="p-1.5 text-beatly-text-muted hover:text-white rounded-lg hover:bg-beatly-surface-hover opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // Optional: open menu
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-beatly-primary transition-colors">{group.name}</h3>
        <p className="text-sm text-beatly-text-muted line-clamp-2">{group.description}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-beatly-border flex items-center justify-between text-xs font-semibold text-beatly-text-muted">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{group.memberCount} members</span>
        </div>
        <div className="bg-beatly-surface-hover px-2 py-1 rounded-md">
          {group.role === 'admin' ? 'Admin' : 'Member'}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
