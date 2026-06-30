import React from 'react';
import { motion } from 'framer-motion';

const getHabitIcon = (habitName) => {
  if (habitName.includes('Night')) return '🌙';
  if (habitName.includes('Morning')) return '☀️';
  if (habitName.includes('Genre')) return '🧭';
  if (habitName.includes('Artist')) return '👤';
  if (habitName.includes('Album')) return '🎵';
  return '✨';
};

const HabitCard = ({ habit, index = 0 }) => {
  const percentage = Math.round(habit.confidence * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-beatly-surface border border-white/5 p-5 rounded-3xl relative overflow-hidden group"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-white text-lg flex items-center gap-2">
          <span>{getHabitIcon(habit.habit)}</span> {habit.habit}
        </h4>
        <span className="text-xs font-bold px-3 py-1 bg-beatly-primary/20 text-beatly-primary rounded-full">
          {percentage}% Match
        </span>
      </div>

      <div className="w-full bg-[#111] rounded-full h-3 mb-4 overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-beatly-primary h-full rounded-full"
        />
      </div>

      <div className="relative">
        <ul className="space-y-1">
          {habit.evidence.map((ev, j) => (
            <li key={j} className="text-gray-400 text-sm flex items-start gap-2">
              <span className="text-blue-400 mt-1">●</span> {ev}
            </li>
          ))}
        </ul>
        
        {/* Hover Tooltip Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-beatly-surface/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 text-center border border-white/10 opacity-0 transition-opacity"
        >
          <p className="text-sm text-gray-300">
            <span className="block font-bold text-beatly-primary mb-1">Why Beatly thinks this:</span>
            Based on your last 30 days of listening, this pattern has remained consistent above our 75% confidence threshold.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
