'use client';

import React from 'react';

export function GameCanvasSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin" />
        <span className="text-xs uppercase tracking-[0.35em]">Loading Game</span>
      </div>
    </div>
  );
}
