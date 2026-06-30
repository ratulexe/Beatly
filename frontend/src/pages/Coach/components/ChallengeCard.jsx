import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, ArrowRight, Trophy, Coins } from 'lucide-react';

const ChallengeCard = ({ challenge, currentUserId, index = 0, onJoin, isJoining = false }) => {
  const participant = challenge.participants?.find((p) => String(p.userId?._id || p.userId) === String(currentUserId));
  const isJoined = Boolean(participant);
  const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  const progressPercentage = challenge.target > 0
    ? Math.min(100, Math.round(((participant?.progress || 0) / challenge.target) * 100))
    : 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 10px 40px -10px rgba(168, 85, 247, 0.2)' }}
      className="bg-beatly-surface border border-white/5 p-6 rounded-3xl space-y-5 hover:border-purple-500/30 transition-all relative overflow-hidden group"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />

      <div className="flex justify-between items-start relative z-10">
        <div className="bg-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-2 tracking-wider">
          {challenge.isGlobal ? <><Users size={12}/> Global Challenge</> : 'Group Challenge'}
        </div>
        <div className="bg-white/5 px-3 py-1 rounded-full text-gray-400 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
          <Clock size={12} /> {daysLeft > 0 ? `${daysLeft} days left` : 'Ends today'}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{challenge.description}</p>
      </div>

      <div className="flex gap-4 relative z-10">
        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-xs font-bold">
          <Trophy size={14} className="text-yellow-400" /> <span className="text-white">+{challenge.xpReward || 0} XP</span>
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-xs font-bold">
          <Coins size={14} className="text-beatly-primary" /> <span className="text-white">+{challenge.coinReward || 0} Coins</span>
        </div>
      </div>

      <div className="pt-2 relative z-10">
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
          <span>{isJoined ? 'Progress' : 'Target'}</span>
          <span className="text-white">{isJoined ? `${progressPercentage}%` : `${challenge.target} ${challenge.unit}`}</span>
        </div>
        
        {isJoined ? (
          <div className="w-full bg-[#111] rounded-full h-2 mb-4 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1 }}
              className="bg-purple-500 h-full rounded-full"
            />
          </div>
        ) : (
          <div className="w-full bg-[#111] rounded-full h-2 mb-4 overflow-hidden border border-white/5" />
        )}

        <div className="flex justify-end">
          {isJoined ? (
            <button className="bg-white/10 text-white px-6 py-2.5 rounded-full font-bold text-sm cursor-default w-full">
              Challenge Active
            </button>
          ) : (
            <button 
              disabled={isJoining}
              onClick={() => onJoin(challenge._id)}
              className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isJoining ? 'Joining...' : 'Join Challenge'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
