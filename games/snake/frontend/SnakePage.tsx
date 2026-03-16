'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GamePageShell } from '@/games/shared/frontend/GamePageShell';
import { GameCanvasSkeleton } from '@/games/shared/frontend/GameCanvasSkeleton';

const SnakeCanvas = dynamic(() => import('./SnakeCanvas').then((mod) => mod.SnakeCanvas), {
  ssr: false,
  loading: () => <GameCanvasSkeleton />,
});

export function SnakePage() {
  return (
    <GamePageShell
      title="Neon Snake"
      subtitle="Arcade Reflexes"
      description="An electrified snake arena with speed scaling, neon visuals, and endless replayability."
      status="COMING SOON"
      accent="#34d399"
      stats={[
        { label: 'Mode', value: 'Endless' },
        { label: 'Speed', value: 'Adaptive' },
        { label: 'Score', value: 'Global' },
      ]}
    >
      <SnakeCanvas />
    </GamePageShell>
  );
}
