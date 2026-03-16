'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export type GameMode = 'online' | 'friends' | 'ai' | 'pass';

interface GameModeContextValue {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
}

const GameModeContext = createContext<GameModeContextValue | null>(null);

export function GameModeProvider({
  children,
  defaultMode = 'online',
}: {
  children: React.ReactNode;
  defaultMode?: GameMode;
}) {
  const [mode, setMode] = useState<GameMode>(defaultMode);
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <GameModeContext.Provider value={value}>{children}</GameModeContext.Provider>;
}

export function useGameMode() {
  const ctx = useContext(GameModeContext);
  if (!ctx) throw new Error('useGameMode must be used inside GameModeProvider');
  return ctx;
}
