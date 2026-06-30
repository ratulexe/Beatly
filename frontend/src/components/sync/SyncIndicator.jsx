import React from 'react';
import { useSync } from '../../context/SyncContext';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SyncIndicator = () => {
  const { isOnline, isSyncing } = useSync();

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {!isOnline ? (
        <span className="flex items-center gap-1 text-red-500">
          <XCircle size={16} /> Offline
        </span>
      ) : isSyncing ? (
        <span className="flex items-center gap-1 text-blue-500">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <RefreshCw size={16} />
          </motion.div>
          Syncing...
        </span>
      ) : (
        <span className="flex items-center gap-1 text-green-500 opacity-70">
          <CheckCircle2 size={16} /> Synced
        </span>
      )}
    </div>
  );
};
