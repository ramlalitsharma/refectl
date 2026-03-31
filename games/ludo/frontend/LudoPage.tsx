'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Link } from '@/lib/navigation';
import { GamePageShell } from '@/games/shared/frontend/GamePageShell';
import { GameCanvasSkeleton } from '@/games/shared/frontend/GameCanvasSkeleton';
import { Button } from '@/components/ui/Button';
import { FEATURED_GAMES } from '@/games/portal/data';
import { useGameMode } from '@/games/shared/frontend/GameModeContext';
import { Bot, Shuffle, Users, Wifi } from 'lucide-react';

const LudoArena = dynamic(() => import('./LudoArena').then((mod) => mod.LudoArena), {
  ssr: false,
  loading: () => <GameCanvasSkeleton />,
});

const MODE_OPTIONS = [
  {
    id: 'online',
    title: 'Play Online',
    subtitle: 'Ranked live rooms',
    icon: Wifi,
    tone: 'from-cyan-400/20 to-blue-500/10 border-cyan-400/40',
  },
  {
    id: 'friends',
    title: 'Play With Friends',
    subtitle: 'Private invite rooms',
    icon: Users,
    tone: 'from-fuchsia-400/20 to-violet-500/10 border-fuchsia-400/35',
  },
  {
    id: 'ai',
    title: 'Vs Computer',
    subtitle: 'Practice locally',
    icon: Bot,
    tone: 'from-emerald-400/20 to-teal-500/10 border-emerald-400/35',
  },
  {
    id: 'pass',
    title: 'Pass N Play',
    subtitle: 'One device local play',
    icon: Shuffle,
    tone: 'from-amber-300/20 to-orange-500/10 border-amber-300/35',
  },
] as const;

function LudoModeAside() {
  const { mode, setMode } = useGameMode();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2.35rem] border border-[#2f5db8]/45 bg-[radial-gradient(circle_at_top,rgba(77,123,229,0.55),rgba(20,45,108,0.96)_58%,rgba(10,22,60,1)_100%)] p-5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(120,154,255,0.36),rgba(28,56,140,0.95)_52%,rgba(11,26,69,0.98)_100%)] px-5 py-6 sm:px-8 sm:py-8">
          <span className="pointer-events-none absolute inset-0 opacity-35 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_8%),linear-gradient(45deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_8%)] bg-[size:46px_46px]" />
          <span className="pointer-events-none absolute -left-10 top-14 h-32 w-32 rounded-full bg-cyan-300/12 blur-3xl" />
          <span className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-amber-300/14 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-[10px] uppercase tracking-[0.38em] text-cyan-100/80">Classic Lobby</p>
            <div className="mt-4 flex items-center justify-center gap-3 sm:gap-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/75 bg-[linear-gradient(180deg,#ff686d,#d61722)] shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)]" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/75 bg-[linear-gradient(180deg,#63e29b,#0ea348)] shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)]" />
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/15 bg-white/8 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.75)]">
                <Image src="/games/logos/ludo.svg" alt="Ludo Royale logo" width={52} height={52} />
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/75 bg-[linear-gradient(180deg,#87dcff,#1a99e3)] shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)]" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/75 bg-[linear-gradient(180deg,#fff38a,#f1b617)] shadow-[0_12px_24px_-14px_rgba(0,0,0,0.7)]" />
            </div>
            <h3 className="mt-5 text-3xl font-[var(--font-lora)] font-semibold text-white sm:text-4xl">Choose Your Ludo Mode</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Jump into the same four familiar choices you expect from a great Ludo app: online rooms, private friend invites, computer practice, and pass-n-play on one device.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {MODE_OPTIONS.map((item) => {
                const active = mode === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`group relative overflow-hidden rounded-[1.6rem] border p-4 text-center shadow-[0_18px_35px_-25px_rgba(0,0,0,0.8)] transition ${
                      active
                        ? 'border-[#f0cf52] bg-[linear-gradient(180deg,#ffe885,#ffbe24)] text-[#17315d]'
                        : 'border-[#f0cf52]/50 bg-[linear-gradient(180deg,#ffe16c,#f5b31e)] text-[#17315d] hover:-translate-y-1 hover:brightness-[1.04]'
                    }`}
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),transparent_35%)]" />
                    <div className="relative flex flex-col items-center justify-center gap-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] border ${active ? 'border-[#17315d]/15 bg-white/30' : 'border-[#17315d]/18 bg-white/24'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-black">{item.title}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#17315d]/75">{item.subtitle}</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${active ? 'bg-[#17315d]/12 text-[#17315d]' : 'bg-[#17315d]/10 text-[#17315d]'}`}>
                        {active ? 'Selected' : 'Tap To Play'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODE_OPTIONS.map((item) => {
          const active = mode === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`group rounded-[1.8rem] border p-5 text-left shadow-[0_18px_35px_-25px_rgba(0,0,0,0.8)] transition ${
                active
                  ? 'border-[#f0cf52] bg-[linear-gradient(180deg,#ffe06a,#ffbf22)] text-[#17315d]'
                  : 'border-[#2f5db8]/40 bg-[linear-gradient(180deg,rgba(42,91,188,0.48),rgba(15,33,82,0.82))] text-white hover:-translate-y-1 hover:border-[#4f7ce0]'
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] border ${
                active ? 'border-[#17315d]/20 bg-white/30 text-[#17315d]' : 'border-white/10 bg-slate-950/35 text-white'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={`mt-4 text-lg font-black ${active ? 'text-[#17315d]' : 'text-white'}`}>{item.title}</p>
              <p className={`mt-1 text-xs uppercase tracking-[0.28em] ${active ? 'text-[#1f3b71]' : 'text-slate-300'}`}>{item.subtitle}</p>
              <div className={`mt-5 inline-flex rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${
                active
                  ? 'bg-[#17315d]/12 text-[#17315d]'
                  : 'bg-[#102858]/70 text-[#f7d24f] group-hover:bg-[#15306a]'
              }`}>
                {active ? 'Selected' : 'Play Mode'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LudoPage() {
  const relatedGames = FEATURED_GAMES.filter((game) => game.id !== 'ludo').slice(0, 3);

  return (
    <>
      <GamePageShell
        title="Ludo Royale"
        subtitle="Classic Strategy Board"
        description="Race your tokens to the center, block rivals, and claim victory. Built for fast matchmaking, rich visuals, and competitive play."
        status="LIVE"
        accent="#f59e0b"
        logoSrc="/games/logos/ludo.svg"
        aside={<LudoModeAside />}
        defaultMode="pass"
        asideLayout="below"
        actions={
          <>
            <Button asChild className="h-12 rounded-2xl bg-cyan-500 px-6 text-slate-950 hover:bg-cyan-400">
              <a href="#game-board">Play Now</a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/20 px-6 text-white hover:bg-white/10">
              <a href="#game-modes">Choose Mode</a>
            </Button>
          </>
        }
        stats={[
          { label: 'Players', value: '2-4 Seats' },
          { label: 'Avg Match', value: '10-15 min' },
          { label: 'Modes', value: 'Online + Friends + AI' },
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
            { title: 'Real Local Match', description: 'Play a full four-seat Ludo match on one device with real captures, turn order, and exact-finish rules.' },
            { title: 'Live Room Links', description: 'Create a friends room, copy the invite link, and let multiple players join the same board live on this server.' },
            { title: 'Computer Practice', description: 'Switch into AI mode to control Ruby while the other colors take automatic turns.' },
          ],
        }}
      >
        <LudoArena variant="canvas" />
      </GamePageShell>

      <section className="bg-slate-950 px-4 pb-20">
        <div className="mx-auto max-w-6xl space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Related Games</p>
              <h2 className="mt-2 text-2xl font-[var(--font-lora)] font-semibold text-white">Keep the session going</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-300">
              Discover the next high-retention match without leaving the gaming flow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {relatedGames.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={game.thumbnail}
                    alt={`${game.title} preview`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white">
                    {game.status}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Image src={game.logo} alt={`${game.title} logo`} width={24} height={24} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{game.category}</p>
                      <h3 className="text-lg font-semibold text-white">{game.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{game.description}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{game.meta.players}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{game.meta.playtime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
