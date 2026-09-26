'use client';

import { motion } from 'motion/react';
import type { QuickAction } from '@/types/portfolio';

interface Props {
  actions: QuickAction[];
  onAction: (payload: string) => void;
}

export function QuickActionBar({ actions, onAction }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-1 max-w-[92%]">
      {actions.map((action, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.18 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onAction(action.payload)}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-foreground-muted hover:border-violet-500 hover:text-violet-400 transition-colors cursor-pointer"
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}
