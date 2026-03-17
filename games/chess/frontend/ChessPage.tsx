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
      logoSrc="/games/logos/chess.svg"
      heroSrc="/og/games/chess.svg"
      stats={[
        { label: 'Players', value: '1v1 Ranked' },
        { label: 'Skill', value: 'ELO Matchmaking' },
        { label: 'Modes', value: 'Rapid + Blitz' },
      ]}
      guide={{
        heading: 'Prepare for Nebula Chess',
        subheading: 'Train openings, sharpen tactics, and track your progress with competitive tools.',
        steps: [
          'Choose your opening and control the center early.',
          'Develop minor pieces before launching attacks.',
          'Coordinate rooks and queen for decisive pressure.',
          'Review the analysis report after each match.',
        ],
        tips: [
          'King safety wins more games than flashy attacks.',
          'Play rapid games to practice time control.',
          'Look for tactical motifs every move.',
        ],
        highlights: [
          { title: 'Matchmaking Ready', description: 'Balanced pairing with future ELO and rapid queues.' },
          { title: 'Deep Analysis', description: 'Post-game insights planned for every match.' },
        ],
      }}
    >
      <ChessCanvas />
    </GamePageShell>
  );
}
