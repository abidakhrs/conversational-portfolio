'use client';

import { motion } from 'motion/react';
import type { Message } from '@/types/portfolio';
import { MessageBubble } from './MessageBubble';
import { QuickActionBar } from './QuickActionBar';
import { CardRenderer } from './CardRenderer';

interface Props {
  message: Message;
  onAction: (payload: string) => void;
}

export function ChatMessage({ message, onAction }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <MessageBubble message={message} />
      {!isUser && message.card && (
        <CardRenderer card={message.card} onAction={onAction} />
      )}
      {!isUser && message.quickActions && message.quickActions.length > 0 && (
        <QuickActionBar actions={message.quickActions} onAction={onAction} />
      )}
    </motion.div>
  );
}
