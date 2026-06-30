import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';

const AIInsightCard = ({ suggestion }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-[#1a1a2e] to-beatly-surface border border-beatly-primary/20 p-8 rounded-[2rem] space-y-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <Activity size={120} />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full bg-beatly-primary/20 flex items-center justify-center">
          <Sparkles className="text-beatly-primary" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Today's Advice</h3>
          <p className="text-xs font-bold text-beatly-primary uppercase tracking-wider">AI Generated</p>
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        <p className="text-gray-200 text-xl leading-relaxed font-medium">
          "{suggestion || 'You usually discover more artists after 9 PM. Tonight is your best opportunity to complete today\'s challenge.'}"
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/10 relative z-10">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-bold uppercase">Confidence</span>
          <span className="text-white font-bold text-sm">94%</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-bold uppercase">Based On</span>
          <span className="text-white font-bold text-sm">30 Days of Listening</span>
        </div>
        <button className="ml-auto bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
          Explain Why
        </button>
      </div>
    </motion.div>
  );
};

export default AIInsightCard;
