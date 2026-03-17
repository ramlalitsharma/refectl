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
      guide={{
        heading: 'How to play Ludo Royale',
        subheading: 'Roll the dice, move tokens safely, and race to the center before your rivals.',
        steps: [
          'Roll to unlock your first token and enter the track.',
          'Move clockwise, protecting tokens in safe zones.',
          'Capture rival tokens to reset their progress.',
          'Reach the center with all tokens to win the match.',
        ],
        tips: [
          'Prioritize unlocking multiple tokens early for flexibility.',
          'Stay in safe zones when opponents are nearby.',
          'Chain captures to slow down the leader.',
        ],
        highlights: [
          { title: 'Instant Matchmaking', description: 'Jump into competitive rooms with global players in seconds.' },
          { title: 'Friend Rooms', description: 'Create private tables for friends and family instantly.' },
        ],
      }}
    >
      <LudoArena variant="canvas" />
    </GamePageShell>
  );
}
