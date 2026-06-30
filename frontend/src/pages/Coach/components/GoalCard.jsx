import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Coins, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GoalCard = ({ goal, index = 0 }) => {
  const percentage = Math.min(100, Math.round((goal.progress / goal.target) * 100));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 10px 40px -10px rgba(29, 185, 84, 0.2)' }}
      className="bg-beatly-surface border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group transition-all"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-beatly-primary/10 rounded-full blur-3xl group-hover:bg-beatly-primary/20 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {goal.frequency} Goal
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
              goal.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              goal.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {goal.difficulty || 'Medium'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{goal.title}</h3>
          <p className="text-gray-400 text-sm">{goal.aiReason}</p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle 
              cx="32" 
              cy="32" 
              r="28" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeDasharray={`${2 * Math.PI * 28}`} 
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 28 * (1 - percentage / 100)}` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              className="text-beatly-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">
            {percentage}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-bold uppercase">Reward</span>
          <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
            <Trophy size={14} /> +100 XP
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-bold uppercase">Bonus</span>
          <div className="flex items-center gap-1 text-beatly-primary font-bold text-sm">
            <Coins size={14} /> +25 Coins
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-bold uppercase">Est. Time</span>
          <div className="flex items-center gap-1 text-gray-300 font-bold text-sm">
            <Clock size={14} /> 8 mins
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="font-mono text-gray-500 text-sm">
          Progress: <span className="text-white font-bold">{goal.progress}</span> / {goal.target} {goal.unit}
        </div>
        <button 
          onClick={() => toast.success(`Continuing goal: ${goal.title}`)}
          className="bg-white/5 hover:bg-beatly-primary hover:text-black text-white px-5 py-2 rounded-full transition-colors flex items-center gap-2 text-sm font-bold"
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default GoalCard;
