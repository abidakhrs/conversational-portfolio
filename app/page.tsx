import { ChatWindow } from '@/components/ChatWindow';
import { ThemeToggle } from '@/components/ThemeToggle';
import profileData from '@/data/profile.json';

export default function Home() {
  const profile = profileData;

  return (
    <main className="h-full flex flex-col items-center justify-center bg-bg p-0 sm:p-4">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Chat container */}
      <div
        className="relative z-10 flex flex-col w-full h-full sm:h-[700px] sm:max-w-md sm:rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border border-violet-500/40 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none truncate">{profile.name}</p>
            <p className="text-xs text-foreground-muted mt-0.5 truncate">{profile.title}</p>
          </div>
          
          <ThemeToggle />
        </div>

        {/* The chat */}
        <div className="flex-1 min-h-0">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}
