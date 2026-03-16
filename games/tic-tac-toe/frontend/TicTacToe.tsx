'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TicTacToeEngine, type SquareValue } from '@/games/tic-tac-toe/core/engine';

export function TicTacToe({ variant = 'full' }: { variant?: 'full' | 'board' }) {
  const [squares, setSquares] = useState<SquareValue[]>(TicTacToeEngine.createEmptyBoard());
  const [xIsNext, setXIsNext] = useState(true);

  const winner = useMemo(() => TicTacToeEngine.calculateWinner(squares), [squares]);
  const winningLine = useMemo(() => TicTacToeEngine.getWinningLine(squares), [squares]);
  const isDraw = useMemo(() => TicTacToeEngine.isDraw(squares), [squares]);

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
      ? 'Draw game'
      : `Next turn: ${xIsNext ? 'X' : 'O'}`;

  const handleSquareClick = (index: number) => {
    if (winner || squares[index]) return;
    const player = xIsNext ? 'X' : 'O';
    const nextSquares = TicTacToeEngine.applyMove(squares, index, player);
    if (nextSquares === squares) return;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setSquares(TicTacToeEngine.createEmptyBoard());
    setXIsNext(true);
  };

  const isBoardOnly = variant === 'board';

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 p-6 md:p-10 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(600px_260px_at_15%_-10%,rgba(34,211,238,0.2),transparent_60%),radial-gradient(500px_220px_at_90%_20%,rgba(245,158,11,0.15),transparent_60%)] dark:opacity-100 dark:bg-[radial-gradient(600px_260px_at_15%_-10%,rgba(34,211,238,0.2),transparent_60%),radial-gradient(520px_220px_at_90%_20%,rgba(245,158,11,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/10" />

      <div className="relative flex flex-col gap-8">
        {!isBoardOnly && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="info" size="sm" className="bg-cyan-500/15 text-cyan-900 border border-cyan-400/40 dark:text-cyan-200">Live Game</Badge>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Browser Play</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-[var(--font-lora)] font-semibold text-slate-900 dark:text-white">Tic Tac Toe</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                A fast, tactical duel. Control the center, create forks, and lock in three to win.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {status}
              </span>
              {winner && <Badge variant="success" size="sm" className="border border-emerald-400/40">Match Complete</Badge>}
              {isDraw && <Badge variant="warning" size="sm" className="border border-amber-400/40">Draw</Badge>}
            </div>
          </div>
        )}

        <div className={`grid gap-10 items-center ${isBoardOnly ? 'lg:grid-cols-1' : 'lg:grid-cols-[320px,1fr]'}`}>
          <div className="w-full max-w-[320px] mx-auto">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[inset_0_0_30px_rgba(148,163,184,0.35)] dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[inset_0_0_30px_rgba(15,23,42,0.8)]">
              <div className="grid grid-cols-3 gap-3">
                {squares.map((value, idx) => {
                  const isWinningSquare = winningLine?.includes(idx);
                  const valueClass =
                    value === 'X'
                      ? 'text-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)] dark:text-cyan-300 dark:drop-shadow-[0_0_14px_rgba(34,211,238,0.55)]'
                      : value === 'O'
                        ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.35)] dark:text-amber-300 dark:drop-shadow-[0_0_14px_rgba(245,158,11,0.55)]'
                        : 'text-slate-300 dark:text-slate-600';
                  return (
                    <button
                      key={`square-${idx}`}
                      type="button"
                      aria-label={`Play square ${idx + 1}`}
                      onClick={() => handleSquareClick(idx)}
                      className={`aspect-square w-full rounded-2xl border border-slate-200 bg-white/90 text-3xl font-black transition-all hover:border-cyan-400/60 hover:shadow-[0_12px_30px_-18px_rgba(34,211,238,0.45)] dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-cyan-400/50 dark:hover:shadow-[0_12px_30px_-18px_rgba(34,211,238,0.8)] ${
                        isWinningSquare ? 'ring-2 ring-emerald-400/60 bg-emerald-400/10 dark:ring-emerald-400/70 dark:bg-emerald-500/10' : ''
                      } ${valueClass}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" onClick={reset} className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_16px_30px_-18px_rgba(34,211,238,0.55)]">
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={reset} className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
                New Match
              </Button>
            </div>
          </div>

          {!isBoardOnly && (
            <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Objective</p>
                  <p className="mt-2 text-base text-slate-900 dark:text-white">Align three marks to claim the grid.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Tempo</p>
                  <p className="mt-2 text-base text-slate-900 dark:text-white">Block threats and create double-win forks.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Pro Tip</p>
                <p className="mt-2 text-base text-slate-700 dark:text-slate-200">
                  Prioritize the center and corners to maximize winning paths.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
