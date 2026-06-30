import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, useInView } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAnimatedIcon } from './AnimatedIcons';

export const AchievementCard = memo(({ achievement, isCompleted, currentProg, threshold }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(cardRef, { once: false, margin: "0px 0px -100px 0px" });
  
  // Tilt values
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);
  const backgroundPosition = useTransform(
    () => `${mouseX.get() * 100}% ${mouseY.get() * 100}%`
  );

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || reducedMotion || !isHovered) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!reducedMotion) {
      mouseX.set(0.5);
      mouseY.set(0.5);
    }
  };

  let percentage = 0;
  if (typeof threshold === 'number') {
    percentage = Math.min(100, Math.round((currentProg / threshold) * 100));
  } else {
    percentage = isCompleted ? 100 : 0;
  }

  const getRarityStyles = (rarity) => {
    if (!isCompleted) return 'border-white/5 opacity-80';
    switch(rarity) {
      case 'Legendary': return 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] bg-yellow-400/5';
      case 'Epic': return 'border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.3)] bg-purple-400/5';
      case 'Rare': return 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)] bg-blue-400/5';
      default: return 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)] bg-green-500/5';
    }
  };

  // Determine if animations should play
  const shouldAnimate = isInView && !reducedMotion;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isTouchDevice || reducedMotion || !isHovered ? 0 : rotateX,
        rotateY: isTouchDevice || reducedMotion || !isHovered ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative w-full rounded-2xl border bg-beatly-surface/80 backdrop-blur-md overflow-hidden transition-all duration-300 ${getRarityStyles(achievement.rarity)}`}
    >
      {/* Glare effect */}
      {isHovered && !isTouchDevice && !reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 opacity-30 mix-blend-overlay rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${backgroundPosition}, rgba(255,255,255,0.8) 0%, transparent 80%)`,
          }}
        />
      )}

      {/* Locked Overlay */}
      {!isCompleted && (
        <motion.div 
          animate={isHovered ? { backdropFilter: "blur(2px)", backgroundColor: "rgba(0,0,0,0.6)" } : { backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.8)" }}
          className="absolute inset-0 z-40 flex items-center justify-center transition-all duration-300"
        >
          <motion.div
            animate={isHovered ? { scale: 0.9, opacity: 0.5 } : { scale: 1, opacity: 1 }}
          >
            <Lock size={40} className="text-gray-400 drop-shadow-md" />
          </motion.div>
        </motion.div>
      )}

      <div className="flex flex-col items-center text-center p-6 h-full relative z-20">
        
        {/* Animated Icon */}
        <div className="mb-6 mt-4" style={{ transform: 'translateZ(30px)' }}>
          {getAnimatedIcon(achievement.title, { isHovered: isHovered && shouldAnimate, reducedMotion })}
        </div>
        
        <h3 className="font-extrabold text-xl mb-2 text-white drop-shadow-sm" style={{ transform: 'translateZ(20px)' }}>
          {achievement.title}
        </h3>
        
        <p className={`text-sm mb-6 max-w-[200px] ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`} style={{ transform: 'translateZ(10px)' }}>
          {achievement.description}
        </p>
        
        <div className="flex items-center gap-2 mb-6" style={{ transform: 'translateZ(10px)' }}>
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${isCompleted ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/5 text-gray-500'}`}>
            {achievement.rarity}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-beatly-primary/20 text-beatly-primary border border-beatly-primary/30">
            +{achievement.xpReward} XP
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full mt-auto" style={{ transform: 'translateZ(5px)' }}>
          <div className="flex justify-between text-xs mb-2 font-bold text-gray-400">
            <span>{isCompleted ? 'Completed' : 'Progress'}</span>
            {typeof threshold === 'number' && (
              <span className={isCompleted ? 'text-beatly-primary' : ''}>
                {Math.min(currentProg, threshold)} / {threshold}
              </span>
            )}
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden shadow-inner relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
              transition={{ duration: 1.5, type: "spring", bounce: 0 }}
              className={`absolute top-0 left-0 h-full rounded-full ${
                isCompleted 
                  ? 'bg-gradient-to-r from-beatly-primary/80 to-beatly-primary shadow-[0_0_10px_rgba(29,185,84,0.5)]' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-500'
              }`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
