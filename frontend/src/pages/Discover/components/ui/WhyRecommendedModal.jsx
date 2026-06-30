import React from 'react';
import { X, Sparkles, Target, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WhyRecommendedModal = ({ isOpen, onClose, rec }) => {
  if (!isOpen || !rec) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-beatly-surface border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 text-purple-400 font-bold mb-2">
                <Sparkles size={16} /> Beatly AI
              </div>
              <h2 className="text-2xl font-black text-white">Why {rec.entityName}?</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Top Match / Because you listen to */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Target size={18} /> <span className="font-semibold">Top Match</span>
              </div>
              <p className="text-lg text-white">
                You frequently listen to <span className="font-bold text-beatly-primary">{rec.tags?.[0] || 'Similar Artists'}</span>
                {rec.tags?.[1] ? ` and ${rec.tags[1]}` : ''}.
              </p>
            </div>

            {/* AI Explanation Text */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Activity size={18} /> <span className="font-semibold">The Connection</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {rec.aiExplanation}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Shared Genres</span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white">Alternative Rock</span>
                  <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white">Indie</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Listening Time</span>
                <span className="text-white font-bold">Late Night</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-sm mb-1">Confidence</span>
                <span className="text-2xl font-black text-purple-400">{rec.confidenceScore}%</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-sm mb-1">Category</span>
                <span className="text-lg font-bold text-white capitalize">{rec.category}</span>
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WhyRecommendedModal;
