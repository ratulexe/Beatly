import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Flame, Trophy, Headphones, Target } from 'lucide-react';

const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const QuickStats = ({ dashboard }) => {
  const { streak = 12, songsToday = 0, lastSyncedAt = null } = dashboard || {};
  const totalXp = 1250;
  const coins = 245;

  // Format time ago
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Unknown";
    const hours = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60));
    if (hours === 0) {
      const mins = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60));
      return `${mins} minutes ago`;
    }
    return `${hours} hours ago`;
  };

  const stats = [
    { label: 'Current Streak', value: streak, unit: 'Days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Total XP', value: totalXp, unit: 'XP', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { 
      label: "Today's Listening", 
      value: songsToday, 
      unit: 'songs', 
      icon: Headphones, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      tooltip: lastSyncedAt ? (
        <div className="absolute top-full left-0 mt-2 bg-[#222] border border-white/10 p-3 rounded-xl shadow-2xl z-50 min-w-[240px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase mb-1">
            <span className="text-sm">⚠</span> Last synced {getTimeAgo(lastSyncedAt)}
          </div>
          <div className="text-gray-400 text-xs leading-relaxed">
            Some listening activity may not have been synchronized.
          </div>
        </div>
      ) : null
    },
    { label: 'Coins Earned', value: coins, unit: 'Coins', icon: Target, color: 'text-beatly-primary', bg: 'bg-beatly-primary/10' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="bg-beatly-surface border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors relative group"
        >
          <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
            <stat.icon className={stat.color} size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
              <AnimatedNumber value={stat.value} />
              <span className="text-sm font-normal text-gray-500">{stat.unit}</span>
            </div>
          </div>
          {stat.tooltip}
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;
