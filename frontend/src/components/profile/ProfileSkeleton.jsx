import { motion } from 'framer-motion';

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-64 bg-beatly-surface rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 bg-beatly-surface rounded-2xl animate-pulse" />
        <div className="h-48 bg-beatly-surface rounded-2xl animate-pulse md:col-span-2" />
      </div>
    </div>
  );
};
