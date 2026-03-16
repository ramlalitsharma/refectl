'use client';

import React from 'react';
import { INITIAL_BOARD, type ChessPiece } from '@/games/chess/core/engine';

const pieceLabel = (piece: ChessPiece) => {
  if (!piece) return '';
  const map: Record<string, string> = {
    K: 'K',
    Q: 'Q',
    R: 'R',
    B: 'B',
    N: 'N',
    P: 'P',
    k: 'k',
    q: 'q',
    r: 'r',
    b: 'b',
    n: 'n',
    p: 'p',
  };
  return map[piece] ?? '';
};

export function ChessCanvas() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="absolute inset-0 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-slate-950/70" />
      <div className="relative grid grid-cols-8 gap-0.5 rounded-[1.2rem] border border-white/10 bg-slate-900/80 p-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
        {INITIAL_BOARD.flat().map((piece, idx) => {
          const row = Math.floor(idx / 8);
          const col = idx % 8;
          const isDark = (row + col) % 2 === 1;
          return (
            <div
              key={`square-${idx}`}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg font-black ${
                isDark ? 'bg-slate-800/90 text-slate-100' : 'bg-slate-700/60 text-white'
              }`}
            >
              {pieceLabel(piece)}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-amber-200">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
