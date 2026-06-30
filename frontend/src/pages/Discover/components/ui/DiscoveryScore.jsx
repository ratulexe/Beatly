import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';

const DiscoveryScore = ({ scoreData }) => {
  const { score = 0, description = 'New Explorer', details = 'Start listening to discover new music.', previousScore = 0 } = scoreData || {};
  const difference = score - previousScore;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayScore(Math.round(value));
      }
    });
    return () => controls.stop();
  }, [score]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-beatly-surface border border-white/5 rounded-3xl p-6 relative overflow-hidden group h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-wider text-xs mb-6">
        <Target size={14} className="text-blue-400" />
        Discovery Score
      </div>

      <div className="flex items-end gap-4 mb-2 relative z-10">
        <div className="text-6xl font-black text-white tracking-tighter">
          {displayScore}
        </div>
        <div className="text-gray-500 font-bold mb-2">/100</div>
      </div>

      <div className="text-lg font-bold text-white mb-4 relative z-10">
        {description}
      </div>

      <div className="space-y-2 text-sm text-gray-400 mb-6 relative z-10 flex-1">
        <p>{details}</p>
      </div>

      {difference > 0 && (
        <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-xs font-bold relative z-10">
          <TrendingUp size={14} /> +{difference}%
        </div>
      )}
    </motion.div>
  );
};

export default DiscoveryScore;
