'use client';

import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="w-10 h-10 p-0"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </Button>
  );
}

