import React from 'react';
import { User, Shield, MoreHorizontal } from 'lucide-react';

const MemberCard = ({ member, isAdmin, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-beatly-surface rounded-xl border border-beatly-border hover:border-beatly-border-hover transition-colors group">
      <div className="flex items-center gap-4">
        {member.profileImage ? (
          <img src={member.profileImage} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-beatly-surface-hover flex items-center justify-center text-beatly-text-muted">
            <User size={20} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{member.name}</h4>
            {member.role === 'admin' && (
              <Shield size={14} className="text-beatly-primary" />
            )}
          </div>
          <p className="text-xs text-beatly-text-muted">Joined {member.joinedAt || 'recently'}</p>
        </div>
      </div>
      
      {isAdmin && member.role !== 'admin' && (
        <button 
          onClick={() => onRemove(member.id)}
          className="text-xs font-semibold text-beatly-error hover:bg-beatly-error/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Remove
        </button>
      )}
      {!isAdmin && (
        <button className="text-beatly-text-muted hover:text-white p-2">
          <MoreHorizontal size={18} />
        </button>
      )}
    </div>
  );
};

export default MemberCard;
