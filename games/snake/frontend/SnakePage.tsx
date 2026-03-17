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
      guide={{
        heading: 'Survive the Neon Snake arena',
        subheading: 'Eat orbs, grow fast, and keep your turns sharp as the speed ramps up.',
        steps: [
          'Use arrow keys or swipe controls to steer.',
          'Collect energy orbs to grow your snake.',
          'Avoid hitting walls or your own tail.',
          'Chain pickups to boost your score multiplier.',
        ],
        tips: [
          'Use the outer edge to reset your path.',
          'Turn early when speed increases.',
          'Leave escape routes before grabbing clusters.',
        ],
        highlights: [
          { title: 'Adaptive Speed', description: 'Difficulty scales smoothly with every pickup.' },
          { title: 'Global Leaderboards', description: 'Compete with players worldwide for high scores.' },
        ],
      }}
    >
      <SnakeCanvas />
    </GamePageShell>
  );
}
