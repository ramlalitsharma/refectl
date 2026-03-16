'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Crown, Dice5, Users, Bot, Wifi, Shuffle } from 'lucide-react';
import { LudoEngine, type LudoColor } from '@/games/ludo/core/engine';

const PLAYER_STYLES: Record<LudoColor, { label: string; bg: string; ring: string; text: string }> = {
  red: {
    label: 'Ruby',
    bg: 'bg-red-500/90',
    ring: 'ring-red-300/70',
    text: 'text-red-100',
  },
  green: {
    label: 'Emerald',
    bg: 'bg-emerald-500/90',
    ring: 'ring-emerald-300/70',
    text: 'text-emerald-100',
  },
  yellow: {
    label: 'Amber',
    bg: 'bg-amber-400/95',
    ring: 'ring-amber-200/70',
    text: 'text-amber-100',
  },
  blue: {
    label: 'Azure',
    bg: 'bg-sky-500/90',
    ring: 'ring-sky-300/70',
    text: 'text-sky-100',
  },
};

export function LudoArena({ variant = 'full' }: { variant?: 'full' | 'canvas' }) {
  const [state, setState] = useState(() => LudoEngine.createGame());
  const [rolling, setRolling] = useState(false);

  const players = useMemo(() => LudoEngine.DEFAULT_PLAYERS, []);
  const activePlayer = players[state.currentPlayerIndex];
  const activeStyle = PLAYER_STYLES[activePlayer.id];
  const isCanvas = variant === 'canvas';

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);
    const next = LudoEngine.rollDice();
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        diceValue: next,
        lastRoll: next,
        currentPlayerIndex: next === 6 ? prev.currentPlayerIndex : LudoEngine.nextPlayerIndex(prev.currentPlayerIndex, players.length),
      }));
      setRolling(false);
    }, 350);
  };

  const handleReset = () => {
    setState(LudoEngine.createGame());
  };

  return (
    <div className={`relative overflow-hidden rounded-[2.75rem] border border-slate-200 bg-gradient-to-br from-white via-amber-50/60 to-sky-50/40 p-6 md:p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] ${isCanvas ? 'h-full' : ''}`}>
      <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(520px_320px_at_10%_-10%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(520px_320px_at_90%_15%,rgba(245,158,11,0.2),transparent_60%)] dark:opacity-100 dark:bg-[radial-gradient(600px_320px_at_15%_-10%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(520px_320px_at_90%_20%,rgba(245,158,11,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-20 top-6 h-52 w-52 rounded-full bg-sky-400/15 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />

      <div className={`relative grid gap-10 items-center h-full ${isCanvas ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.05fr,1fr]'}`}>
        {!isCanvas && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="info" size="sm" className="bg-amber-400/20 text-amber-900 border border-amber-400/40 dark:text-amber-200">
                Classic Board Game
              </Badge>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Play Ludo Online</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-[var(--font-lora)] font-semibold text-slate-900 dark:text-white tracking-tight">
              Ludo Royale Arena
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl">
              A vibrant, strategic race to the center. Play online with friends, challenge the AI, or host local pass‑and‑play
              matches in seconds.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Play Online', desc: 'Match with real players instantly.', icon: Wifi },
                { title: 'Play With Friends', desc: 'Private rooms and shareable invites.', icon: Users },
                { title: 'Vs Computer', desc: 'Smart AI for quick solo runs.', icon: Bot },
                { title: 'Pass & Play', desc: 'Local turns on one device.', icon: Shuffle },
              ].map((mode) => (
                <div
                  key={mode.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900/5 text-slate-700 flex items-center justify-center dark:bg-white/10 dark:text-white">
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{mode.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">{mode.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-[0_16px_30px_-18px_rgba(251,191,36,0.7)]">
                Play Now
              </Button>
              <Button variant="outline" className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
                Create Room
              </Button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                <Crown className="h-4 w-4" />
                Tournament Ready
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-6 ${isCanvas ? 'max-w-2xl mx-auto h-full' : ''}`}>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="aspect-square rounded-[2.5rem] border border-slate-200 bg-white/90 p-4 shadow-[inset_0_0_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[inset_0_0_50px_rgba(15,23,42,0.7)]">
              <div className="grid grid-cols-2 gap-3 h-full">
                <div className="rounded-2xl bg-red-500/90 relative overflow-hidden">
                  <div className="absolute inset-3 rounded-2xl bg-white/80" />
                  <div className="absolute inset-5 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <span key={`red-${idx}`} className="rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-500/90 relative overflow-hidden">
                  <div className="absolute inset-3 rounded-2xl bg-white/80" />
                  <div className="absolute inset-5 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <span key={`green-${idx}`} className="rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-sky-500/90 relative overflow-hidden">
                  <div className="absolute inset-3 rounded-2xl bg-white/80" />
                  <div className="absolute inset-5 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <span key={`blue-${idx}`} className="rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]" />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-400/90 relative overflow-hidden">
                  <div className="absolute inset-3 rounded-2xl bg-white/80" />
                  <div className="absolute inset-5 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <span key={`yellow-${idx}`} className="rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rotate-45 bg-gradient-to-br from-red-400 via-amber-300 to-emerald-400 opacity-90 rounded-2xl shadow-lg" />
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg dark:border-white/10 dark:bg-slate-950/80">
              <div className={`h-10 w-10 rounded-xl ${activeStyle.bg} ${activeStyle.text} flex items-center justify-center font-black`}>
                {activePlayer.id.toUpperCase().slice(0, 1)}
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Active Turn</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeStyle.label}</p>
              </div>
              <div className={`ml-2 h-11 w-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-900 flex items-center justify-center text-lg font-black shadow-inner dark:border-white/10 dark:bg-white/10 dark:text-white ${activeStyle.ring}`}>
                <Dice5 className={`h-5 w-5 ${rolling ? 'animate-pulse' : ''}`} />
                <span className="sr-only">Dice</span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{state.diceValue}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Players</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">2–4 Online</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Avg Match</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">10–15 min</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleRoll} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400 shadow-[0_16px_30px_-18px_rgba(56,189,248,0.7)]">
              {rolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
            <Button variant="outline" onClick={handleReset} className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
              Reset Match
            </Button>
            {state.lastRoll && (
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Last roll: {state.lastRoll}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
