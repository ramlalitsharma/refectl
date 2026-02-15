'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const resolvedTheme: 'light' | 'dark' = useMemo(
    () => (theme === 'system' ? (systemDark ? 'dark' : 'light') : theme),
    [theme, systemDark]
  );

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';

    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);

    if (theme !== 'system') {
      localStorage.setItem('theme', theme);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('useTheme was rendered outside of ThemeProvider. Falling back to dark theme.');
    }
    return {
      theme: 'dark' as Theme,
      resolvedTheme: 'dark' as const,
      setTheme: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Attempted to set theme without ThemeProvider context.');
        }
      },
    };
  }
  return context;
}
