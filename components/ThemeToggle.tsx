'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // next-themes only knows the resolved theme after hydration, so this
    // flip is how we avoid rendering a mismatched icon on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-foreground-muted hover:text-foreground transition-colors ml-auto"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
