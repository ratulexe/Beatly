import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Flame, Trophy, Coins, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const HeroSection = ({ dashboard }) => {
  const { streak, goals, habits } = dashboard || {};
  const todayGoal = goals?.find(g => g.frequency === 'Daily');
  const coachScore = 82; // Simulated based on logic later

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-beatly-surface to-[#111] border border-white/5"
    >
      {/* Animated Glowing Background Effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-beatly-primary/30 rounded-full blur-[100px] pointer-events-none"
      />
      
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between items-center">
        
        {/* Left Side: Greeting & Score */}
        <div className="flex items-center gap-8 w-full md:w-auto">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-beatly-primary to-green-400 p-1 shrink-0"
          >
            <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center relative">
              <Bot className="text-white relative z-10" size={36} />
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-beatly-primary rounded-full"
              />
            </div>
          </motion.div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-beatly-primary font-bold text-sm uppercase tracking-widest">
              <Bot size={16} /> Beatly Coach
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{getGreeting()}, Ratul</h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                <span className="text-gray-400 text-sm">Coach Score</span>
                <span className="text-white font-bold">{coachScore} <span className="text-gray-500">/ 100</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Focus & CTA */}
        <div className="w-full md:w-auto bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center sm:items-start gap-4 hover:border-beatly-primary/30 transition-colors group">
          <div className="flex items-center gap-2 text-gray-400 text-sm uppercase tracking-wider font-bold">
            <Target size={16} className="text-beatly-primary" /> Today's Focus
          </div>
          <h3 className="text-xl font-bold text-white text-center sm:text-left">
            {todayGoal ? todayGoal.title : "Discover a new Indie artist"}
          </h3>
          <button 
            onClick={() => toast.success("Started today's challenge!")}
            className="mt-2 w-full bg-white text-black font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            Start Challenge <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default HeroSection;
