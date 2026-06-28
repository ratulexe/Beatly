import { motion } from 'framer-motion';

export const ProfileCard = ({ title, children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-beatly-surface/30 backdrop-blur-md border border-white/5 rounded-3xl p-6"
    >
      <h3 className="text-gray-400 font-semibold mb-4 uppercase tracking-wider text-sm">{title}</h3>
      {children}
    </motion.div>
  );
};
