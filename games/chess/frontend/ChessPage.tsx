'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GamePageShell } from '@/games/shared/frontend/GamePageShell';
import { GameCanvasSkeleton } from '@/games/shared/frontend/GameCanvasSkeleton';

const ChessCanvas = dynamic(() => import('./ChessCanvas').then((mod) => mod.ChessCanvas), {
  ssr: false,
  loading: () => <GameCanvasSkeleton />,
});

export function ChessPage() {
  return (
    <GamePageShell
      title="Nebula Chess"
      subtitle="Precision Strategy"
      description="A modern chess arena with sleek visuals, fast matchmaking, and advanced analysis tools."
      status="COMING SOON"
      accent="#a855f7"
      stats={[
        { label: 'Players', value: '1v1 Ranked' },
        { label: 'Skill', value: 'ELO Matchmaking' },
        { label: 'Modes', value: 'Rapid + Blitz' },
      ]}
    >
      <ChessCanvas />
    </GamePageShell>
  );
}
