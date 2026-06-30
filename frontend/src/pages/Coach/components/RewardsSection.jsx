import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Star } from 'lucide-react';

const RewardsSection = ({ xp = 1250 }) => {
  const nextTarget = 2000;
  const percentage = Math.round((xp / nextTarget) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-beatly-surface border border-white/5 p-6 rounded-[2rem] space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Award className="text-yellow-400" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Rewards Journey</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Level 4 Listener</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-white">{xp} XP</span>
          <span className="text-gray-500">{nextTarget} XP</span>
        </div>
        <div className="w-full bg-[#111] rounded-full h-4 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-yellow-500 to-orange-400 h-full rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
          </motion.div>
        </div>
        <p className="text-gray-400 text-xs text-center pt-1">
          {nextTarget - xp} XP until next unlock
        </p>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
            <Lock className="text-gray-500" size={16} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Music Maestro Title</h4>
            <p className="text-gray-400 text-xs">Profile Badge</p>
          </div>
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase">Next Unlock</div>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-beatly-primary/20 border border-beatly-primary/50 flex items-center justify-center">
            <Star className="text-beatly-primary" size={16} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Dedicated Listener</h4>
            <p className="text-beatly-primary text-xs">Active Title</p>
          </div>
        </div>
        <button className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
          Equip
        </button>
      </div>
    </motion.div>
  );
};

export default RewardsSection;
