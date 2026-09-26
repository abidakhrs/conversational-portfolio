'use client';

import type { Message } from '@/types/portfolio';

interface Props {
  message: Message;
}

// Minimal markdown-like renderer: bold (**text**), newlines, links
function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={line === '' ? 'my-1' : ''}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-violet-600 text-white rounded-br-sm'
          : 'bg-surface border border-border text-foreground rounded-bl-sm'
      }`}
    >
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <div className="flex flex-col gap-0.5">{renderContent(message.content)}</div>
      )}
    </div>
  );
}
