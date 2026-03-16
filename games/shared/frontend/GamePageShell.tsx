'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GameModeProvider } from './GameModeContext';
import { GameModePanel } from './GameModePanel';

interface GamePageShellProps {
  title: string;
  subtitle: string;
  description: string;
  status?: 'LIVE' | 'COMING SOON';
  accent?: string;
  children: React.ReactNode;
  stats?: { label: string; value: string }[];
}

export function GamePageShell({
  title,
  subtitle,
  description,
  status = 'LIVE',
  accent = '#22d3ee',
  children,
  stats = [],
}: GamePageShellProps) {
  return (
    <GameModeProvider>
      <div
        className="min-h-screen bg-slate-950 text-white"
        style={{ ['--game-accent' as string]: accent }}
      >
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_-10%,rgba(34,211,238,0.2),transparent_60%),radial-gradient(900px_420px_at_85%_0%,rgba(124,58,237,0.2),transparent_60%),linear-gradient(180deg,#050713_0%,#0a1022_50%,#04050c_100%)]" />
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:52px_52px]" />
          <div
            className="absolute -top-24 right-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--game-accent), transparent 70%)' }}
          />

          <div className="relative mx-auto max-w-6xl px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={status === 'LIVE' ? 'success' : 'warning'} size="sm">
                  {status}
                </Badge>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{subtitle}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-[var(--font-lora)] font-semibold tracking-tight">
                {title}
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">{description}</p>
              {stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px]">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-[inset_0_0_50px_rgba(8,10,20,0.8)]">
                <div className="relative aspect-[16/10] w-full min-h-[420px]">
                  <canvas className="absolute inset-0 h-full w-full opacity-0 pointer-events-none" aria-hidden="true" />
                  <div className="relative h-full w-full">{children}</div>
                </div>
              </div>
            </div>
            <GameModePanel />
          </div>
        </section>
      </div>
    </GameModeProvider>
  );
}
