'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GamePageShell } from '@/games/shared/frontend/GamePageShell';
import { GameCanvasSkeleton } from '@/games/shared/frontend/GameCanvasSkeleton';

const LudoArena = dynamic(() => import('./LudoArena').then((mod) => mod.LudoArena), {
  ssr: false,
  loading: () => <GameCanvasSkeleton />,
});

export function LudoPage() {
  return (
    <GamePageShell
      title="Ludo Royale"
      subtitle="Classic Strategy Board"
      description="Race your tokens to the center, block rivals, and claim victory. Built for fast matchmaking, rich visuals, and competitive play."
      status="LIVE"
      accent="#f59e0b"
      stats={[
        { label: 'Players', value: '2–4 Online' },
        { label: 'Avg Match', value: '10–15 min' },
        { label: 'Modes', value: 'Online + Friends' },
      ]}
    >
      <LudoArena variant="canvas" />
    </GamePageShell>
  );
}
