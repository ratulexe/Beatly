import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

const AIPersonalityCard = ({ habit }) => {
  if (!habit) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-beatly-surface border border-white/5 p-6 rounded-[2rem] space-y-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <UserCircle className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{habit.habit}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Musical Personality</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{Math.round(habit.confidence * 100)}%</div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed">
        You love discovering new artists and rarely repeat playlists. Your listening patterns indicate a strong preference for continuous exploration over deep catalog diving.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1">
            <TrendingUp size={16} /> Strength
          </div>
          <p className="text-white font-medium text-sm">High Discovery Rate</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
            <TrendingDown size={16} /> Weakness
          </div>
          <p className="text-white font-medium text-sm">Low Album Completion</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
        <Lightbulb className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-blue-400 font-bold text-sm">Suggestion</h4>
          <p className="text-blue-200/80 text-sm mt-1">Try to finish one complete album this week to balance your listening profile.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPersonalityCard;
