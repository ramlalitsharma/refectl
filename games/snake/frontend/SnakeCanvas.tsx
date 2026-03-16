'use client';

import React from 'react';
import { DEFAULT_SNAKE_STATE } from '@/games/snake/core/engine';

export function SnakeCanvas() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="absolute inset-0 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-950/80" />
      <div className="relative h-full w-full max-w-[520px]">
        <div className="grid h-full w-full grid-cols-10 gap-1 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
          {Array.from({ length: 100 }).map((_, idx) => (
            <div key={idx} className="h-4 w-4 rounded-md bg-slate-900/70" />
          ))}
          <div className="pointer-events-none absolute left-12 top-12 h-16 w-16 rounded-2xl bg-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
          <div className="pointer-events-none absolute left-28 top-12 h-16 w-16 rounded-2xl bg-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
          <div className="pointer-events-none absolute left-44 top-12 h-16 w-16 rounded-2xl bg-emerald-300/90 shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
        </div>
      </div>
      <div className="absolute bottom-6 right-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-emerald-200">
        Speed {DEFAULT_SNAKE_STATE.speed} • Score {DEFAULT_SNAKE_STATE.score}
      </div>
    </div>
  );
}
