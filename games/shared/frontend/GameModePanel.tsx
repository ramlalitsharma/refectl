'use client';

import React from 'react';
import { useGameMode } from './GameModeContext';
import { Bot, Shuffle, Users, Wifi } from 'lucide-react';

const MODE_ITEMS = [
  {
    id: 'online',
    title: 'Play Online',
    description: 'Match with real players instantly.',
    icon: Wifi,
  },
  {
    id: 'friends',
    title: 'Play With Friends',
    description: 'Private rooms and shareable invites.',
    icon: Users,
  },
  {
    id: 'ai',
    title: 'Vs Computer',
    description: 'Smart AI for solo practice runs.',
    icon: Bot,
  },
  {
    id: 'pass',
    title: 'Pass & Play',
    description: 'Local turns on one device.',
    icon: Shuffle,
  },
] as const;

export function GameModePanel() {
  const { mode, setMode } = useGameMode();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Game Modes</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Choose Your Mode</h3>
      </div>
      <div className="grid gap-3">
        {MODE_ITEMS.map((item) => {
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-cyan-400/60 bg-cyan-500/10 shadow-[0_18px_40px_-30px_rgba(34,211,238,0.8)]'
                  : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-cyan-400/40'
              }`}
            >
              <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${
                isActive ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-300'
              }`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
