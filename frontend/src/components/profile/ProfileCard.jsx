import { motion } from 'framer-motion';

export const ProfileCard = ({ title, children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel p-6"
    >
      <h3 className="text-beatly-text-muted font-bold mb-4 uppercase tracking-wider text-sm">{title}</h3>
      {children}
    </motion.div>
  );
};
