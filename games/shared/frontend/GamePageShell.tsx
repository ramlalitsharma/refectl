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
  guide?: {
    heading?: string;
    subheading?: string;
    steps?: string[];
    tips?: string[];
    highlights?: { title: string; description: string }[];
  };
}

export function GamePageShell({
  title,
  subtitle,
  description,
  status = 'LIVE',
  accent = '#22d3ee',
  children,
  stats = [],
  guide,
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

        {guide && (
          <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">How To Play</p>
                <h2 className="mt-3 text-3xl font-[var(--font-lora)] font-semibold text-white">
                  {guide.heading ?? `Master ${title} in Minutes`}
                </h2>
                {guide.subheading && (
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">{guide.subheading}</p>
                )}
                {guide.steps && guide.steps.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {guide.steps.map((step, index) => (
                      <div
                        key={`${step}-${index}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      >
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Step {index + 1}</p>
                        <p className="mt-2 text-sm text-slate-200 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {guide.tips && guide.tips.length > 0 && (
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Pro Tips</p>
                    <div className="mt-4 space-y-3">
                      {guide.tips.map((tip, index) => (
                        <div key={`${tip}-${index}`} className="flex items-start gap-3 text-sm text-slate-300">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guide.highlights && guide.highlights.length > 0 && (
                  <div className="grid gap-4">
                    {guide.highlights.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-6"
                      >
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </GameModeProvider>
  );
}
