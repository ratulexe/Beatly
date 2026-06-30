import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const StorySlide = ({ children, isActive, direction }) => {
  if (!isActive) return null;

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-8 text-center"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default StorySlide;
