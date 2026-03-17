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
      guide={{
        heading: 'How to win Tic Tac Toe',
        subheading: 'Control the center, build forks, and keep every line defended.',
        steps: [
          'Take the center to maximize winning lines.',
          'Build forks to threaten two lines at once.',
          'Block immediately when your opponent has two in a row.',
          'Force a draw by mirroring the opponent’s best moves.',
        ],
        tips: [
          'Corners are more valuable than edges early on.',
          'Look two moves ahead to set up forks.',
          'Avoid giving away the center in the first move.',
        ],
        highlights: [
          { title: 'Instant Rematch', description: 'Start a new duel in one tap with no load time.' },
          { title: 'Clean UI', description: 'Distraction-free layout tuned for competitive play.' },
        ],
      }}
    >
      <TicTacToe variant="board" />
    </GamePageShell>
  );
}
