import React from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Disc, 
  Music, 
  Flame, 
  Rocket, 
  Moon, 
  Star, 
  Sun, 
  Cloud, 
  Gem,
  Award
} from 'lucide-react';

const transition = { type: "spring", stiffness: 300, damping: 20 };

export const MusicRookieIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    {/* Sound waves */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isHovered && !reducedMotion ? { scale: 1.5, opacity: [0, 0.5, 0] } : { scale: 0.8, opacity: 0 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
      className="absolute w-full h-full rounded-full border-2 border-beatly-primary/50"
    />
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isHovered && !reducedMotion ? { scale: 1.2, opacity: [0, 0.8, 0] } : { scale: 0.8, opacity: 0 }}
      transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeOut" }}
      className="absolute w-full h-full rounded-full border-2 border-beatly-primary"
    />
    <motion.div
      animate={isHovered && !reducedMotion ? { y: [-2, 2, -2] } : { y: 0 }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="z-10"
    >
      <Headphones size={40} className="text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
    </motion.div>
  </div>
);

export const DailyListenerIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <motion.div
      animate={isHovered && !reducedMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      className="relative z-10"
    >
      <Disc size={44} className="text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      {/* Vinyl record center label */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-beatly-primary rounded-full border border-black/50" />
    </motion.div>
    <motion.div
      animate={isHovered && !reducedMotion ? { rotate: 360, scale: [1, 1.2, 1] } : { rotate: 0, scale: 0 }}
      transition={{ rotate: { repeat: Infinity, duration: 4, ease: "linear" }, scale: { duration: 0.3 } }}
      className="absolute w-full h-full"
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <Music size={16} className="text-beatly-primary absolute -top-2 right-0 filter drop-shadow-[0_0_5px_currentColor]" />
    </motion.div>
  </div>
);

export const SevenDayStreakIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <motion.div
      animate={isHovered && !reducedMotion ? { 
        scale: [1, 1.1, 1],
        rotate: [-3, 3, -3],
      } : { scale: 1, rotate: 0 }}
      transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
      className="z-10 relative"
    >
      <Flame size={44} className="text-orange-500 fill-orange-500/20 filter drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
    </motion.div>
    
    {/* Sparks */}
    {isHovered && !reducedMotion && (
      <>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{ 
              opacity: 0, 
              y: -40, 
              x: (Math.random() - 0.5) * 40,
              scale: 0 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.8 + Math.random() * 0.5,
              delay: Math.random() * 0.5
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full filter blur-[1px]"
          />
        ))}
      </>
    )}
  </div>
);

export const ThirtyDayStreakIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <motion.div
      animate={isHovered && !reducedMotion ? { 
        y: [0, -40, 40, 0],
        scale: [1, 0.8, 0.8, 1],
        opacity: [1, 0, 0, 1]
      } : { y: 0, scale: 1, opacity: 1 }}
      transition={{ repeat: Infinity, duration: 2, times: [0, 0.4, 0.5, 1], ease: "easeInOut" }}
      className="z-10 relative"
    >
      <Rocket size={44} className="text-red-500 fill-red-500/20 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
    </motion.div>
    
    {/* Launch trail */}
    {isHovered && !reducedMotion && (
      <motion.div
        animate={{ opacity: [0, 1, 0], height: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 2, times: [0, 0.2, 0.4] }}
        className="absolute bottom-0 w-2 bg-gradient-to-t from-transparent via-orange-400 to-yellow-200 blur-sm rounded-full"
      />
    )}
  </div>
);

export const NightOwlIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <motion.div
      animate={isHovered && !reducedMotion ? { rotate: -15 } : { rotate: 0 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
      className="z-10 relative"
    >
      <Moon size={40} className="text-blue-300 fill-blue-300/30 filter drop-shadow-[0_0_15px_rgba(147,197,253,0.8)]" />
    </motion.div>
    
    <motion.div
      animate={isHovered && !reducedMotion ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="absolute top-0 right-2"
    >
      <Star size={16} className="text-yellow-200 fill-yellow-200 filter drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />
    </motion.div>
    <motion.div
      animate={isHovered && !reducedMotion ? { scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] } : { scale: 1, opacity: 0 }}
      transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
      className="absolute bottom-2 left-0"
    >
      <Star size={12} className="text-yellow-200 fill-yellow-200" />
    </motion.div>
  </div>
);

export const EarlyBirdIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <motion.div
      animate={isHovered && !reducedMotion ? { y: -10, scale: 1.1, filter: "drop-shadow(0 0 20px rgba(250,204,21,1))" } : { y: 0, scale: 1, filter: "drop-shadow(0 0 5px rgba(250,204,21,0.5))" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="z-10 absolute top-2"
    >
      <Sun size={36} className="text-yellow-400 fill-yellow-400" />
    </motion.div>
    
    <motion.div
      animate={isHovered && !reducedMotion ? { x: 5, opacity: 0.9 } : { x: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="z-20 absolute bottom-2 filter drop-shadow-md"
    >
      <Cloud size={44} className="text-white fill-white/80" />
    </motion.div>
  </div>
);

export const PlatinumListenerIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16 overflow-visible">
    <motion.div
      animate={isHovered && !reducedMotion ? { 
        rotateY: 360,
        filter: [
          "drop-shadow(0 0 10px rgba(167,243,208,0.5))",
          "drop-shadow(0 0 30px rgba(167,243,208,1))",
          "drop-shadow(0 0 10px rgba(167,243,208,0.5))"
        ]
      } : { rotateY: 0, filter: "drop-shadow(0 0 10px rgba(167,243,208,0.5))" }}
      transition={{ rotateY: { repeat: Infinity, duration: 3, ease: "linear" }, filter: { repeat: Infinity, duration: 1.5 } }}
      className="z-10 relative"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Gem size={44} className="text-emerald-300 fill-emerald-300/30" strokeWidth={1.5} />
      
      {/* Glint effect inside the rotating gem */}
      {isHovered && !reducedMotion && (
        <motion.div
          animate={{ x: [-20, 20], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full h-full mix-blend-overlay"
          style={{ transform: "rotate(45deg)" }}
        />
      )}
    </motion.div>
  </div>
);

export const GenreExplorerIcon = ({ isHovered, reducedMotion }) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <div className="z-20">
      <Music size={32} className="text-purple-400 filter drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
    </div>
    
    {isHovered && !reducedMotion && (
      <>
        {[0, 120, 240].map((rotation, i) => (
          <motion.div
            key={i}
            animate={{ rotate: rotation + 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute w-full h-full"
          >
            <motion.div
              animate={{ rotate: -(rotation + 360) }} // Keep the icon upright while orbiting
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute top-0 left-1/2 -ml-2"
            >
              <Music size={16} className={`filter drop-shadow-[0_0_5px_currentColor] ${i === 0 ? 'text-pink-400' : i === 1 ? 'text-blue-400' : 'text-green-400'}`} />
            </motion.div>
          </motion.div>
        ))}
      </>
    )}
  </div>
);

export const DefaultIcon = ({ isHovered, reducedMotion }) => (
  <motion.div
    animate={isHovered && !reducedMotion ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
    transition={{ duration: 0.5 }}
    className="relative flex items-center justify-center w-16 h-16"
  >
    <Award size={40} className="text-gray-300 filter drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />
  </motion.div>
);

export const getAnimatedIcon = (title, props) => {
  switch (title) {
    case 'Music Rookie': return <MusicRookieIcon {...props} />;
    case 'Daily Listener': return <DailyListenerIcon {...props} />;
    case '7 Day Streak': return <SevenDayStreakIcon {...props} />;
    case '30 Day Streak': return <ThirtyDayStreakIcon {...props} />;
    case 'Night Owl': return <NightOwlIcon {...props} />;
    case 'Early Bird': return <EarlyBirdIcon {...props} />;
    case 'Platinum Listener': return <PlatinumListenerIcon {...props} />;
    case 'Genre Explorer': return <GenreExplorerIcon {...props} />;
    default: return <DefaultIcon {...props} />;
  }
};
