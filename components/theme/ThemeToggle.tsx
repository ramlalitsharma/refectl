'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-10 h-10 p-0">
        <span className="opacity-0">☀️</span>
      </Button>
    );
  }

  const toggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="w-10 h-10 p-0"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </Button>
  );
}

