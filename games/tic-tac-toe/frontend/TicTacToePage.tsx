'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GamePageShell } from '@/games/shared/frontend/GamePageShell';
import { GameCanvasSkeleton } from '@/games/shared/frontend/GameCanvasSkeleton';

const TicTacToe = dynamic(() => import('./TicTacToe').then((mod) => mod.TicTacToe), {
  ssr: false,
  loading: () => <GameCanvasSkeleton />,
});

export function TicTacToePage() {
  return (
    <GamePageShell
      title="Tic Tac Toe"
      subtitle="Classic Grid Strategy"
      description="A lightning-fast tactical duel. Outsmart your opponent with perfect positioning and timing."
      status="LIVE"
      accent="#22d3ee"
      stats={[
        { label: 'Players', value: '2 Players' },
        { label: 'Avg Match', value: '2–4 min' },
        { label: 'Mode', value: 'Head to Head' },
      ]}
    >
      <TicTacToe variant="board" />
    </GamePageShell>
  );
}
