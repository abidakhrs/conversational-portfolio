'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RotateCcw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Message, ConversationState } from '@/types/portfolio';
import { detectIntent } from '@/engine/intent';
import {
  resolveResponse,
  buildMessage,
  parsePayloadResult,
  payloadLabel,
  greetingResponse,
  helpResponse,
} from '@/engine/router';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

const TYPING_DELAY = 400; // ms
const NAVIGATE_DELAY = 900; // ms — how long the "taking you there" overlay shows

// Turn a URL into something friendly to show in the overlay.
function siteName(url: string): string {
  if (url.includes('github.com')) {
    const parts = url.replace(/\/$/, '').split('/');
    return `github.com/${parts.slice(3, 5).join('/')}`;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Map a resolved intent (plus its entity id) to a router payload. Entity
// intents carry their record id from the engine; section intents map to
// their section payload.
function toPayload(intent: string, entityId?: string): string | null {
  const sections: Record<string, string> = {
    EDUCATION: 'education',
    EXPERIENCE: 'experience',
    PROJECTS: 'projects',
    SKILLS: 'skills',
    CONTACT: 'contact',
    BACK: 'back',
    HOME: 'home',
  };
  if (sections[intent]) return sections[intent];
  if (entityId && intent.startsWith('EDU_')) return `edu:${entityId}`;
  if (entityId && intent.startsWith('EXP_')) return `exp:${entityId}`;
  if (entityId && intent.startsWith('PROJ_')) return `project:${entityId}`;
  return null;
}

function initWelcome(): { messages: Message[]; state: ConversationState } {
  const state: ConversationState = { type: 'WELCOME' };
  const response = resolveResponse(state);
  return {
    messages: [buildMessage(response)],
    state,
  };
}

export function ChatWindow() {
  const initial = initWelcome();
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const [state, setState] = useState<ConversationState>(initial.state);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ─── Keep the input focused at all times ────────────────────────────
  //
  // Clicking a quick action, a card, anywhere in the chat, or even the
  // page background used to blur the input, forcing a second click before
  // typing. This keeps the cursor in the box so the user can always type.

  // After the response settles, put the cursor back.
  useEffect(() => {
    if (typing) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [messages, typing]);

  // A click that lands outside the input refocuses it on the next tick,
  // unless it landed on something interactive or the user is selecting text.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (inputRef.current?.contains(target)) return;
      if (target.closest('a, button, input, textarea, [role="button"]')) return;

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      window.setTimeout(() => inputRef.current?.focus(), 0);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const handleAction = useCallback(
    (payload: string) => {
      // Derive next state from payload. External links are reported back
      // rather than opened inside the parser.
      const { state: nextState, external } = parsePayloadResult(payload, state);

      if (external) {
        // Echo the click, show a short "taking you there" transition, then
        // open the destination in a new tab.
        const userMsg = buildMessage({ role: 'user', content: payloadLabel(payload) });
        setMessages((prev) => [...prev, userMsg]);
        setNavigating(external);
        window.setTimeout(() => {
          window.open(external, '_blank', 'noopener,noreferrer');
          setNavigating(null);
          inputRef.current?.focus();
        }, NAVIGATE_DELAY);
        return;
      }

      // Append user "click" as a message, using a readable label.
      const userMsg = buildMessage({ role: 'user', content: payloadLabel(payload) });
      setMessages((prev) => [...prev, userMsg]);
      setState(nextState);

      // Show typing indicator, then resolve
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const response = resolveResponse(nextState);
        setMessages((prev) => [...prev, buildMessage(response)]);
      }, TYPING_DELAY);
    },
    [state]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;

      setInput('');

      // Detect intent from free text. The engine now owns entity resolution
      // and returns the concrete record id, so the UI no longer keeps a
      // parallel intent -> payload map that can drift from the data.
      const { intent, entityId } = detectIntent(trimmed);

      const userMsg = buildMessage({ role: 'user', content: trimmed });
      setMessages((prev) => [...prev, userMsg]);

      // Respond with typing delay for anything we understood.
      setTyping(true);
      setTimeout(() => {
        setTyping(false);

        let response: Omit<Message, 'id' | 'timestamp'>;
        let nextState: ConversationState = state;

        if (intent === 'GREETING') {
          response = greetingResponse();
        } else if (intent === 'HELP') {
          response = helpResponse();
        } else {
          const payload = toPayload(intent, entityId);
          if (payload) {
            nextState = parsePayloadResult(payload, state).state;
            setState(nextState);
            response = resolveResponse(nextState);
          } else {
            response = resolveResponse(state);
          }
        }

        setMessages((prev) => [...prev, buildMessage(response)]);
      }, TYPING_DELAY);
    },
    [input, state]
  );

  const handleReset = () => {
    const fresh = initWelcome();
    setMessages(fresh.messages);
    setState(fresh.state);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Navigation transition overlay */}
      <AnimatePresence>
        {navigating && (
          <motion.div
            key="navigating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur-sm"
            style={{ background: 'rgba(10, 8, 20, 0.72)' }}
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0.9, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex flex-col items-center gap-2 px-6"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/40 flex items-center justify-center text-violet-300"
              >
                <ExternalLink size={20} />
              </motion.div>
              <p className="text-sm font-semibold text-white">Taking you there…</p>
              <p className="text-xs text-white/60 font-mono truncate max-w-[240px]">
                {siteName(navigating)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-foreground-muted font-medium">Portfolio Chat</span>
        </div>
        <button
          onClick={handleReset}
          title="Restart conversation"
          className="text-foreground-muted hover:text-foreground transition-colors p-1 rounded"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onAction={handleAction} />
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-border shrink-0"
      >
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 focus-within:border-violet-500/60 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Ask about Muhammad's portfolio"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="text-violet-400 disabled:text-foreground-muted transition-colors disabled:cursor-default"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
