'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight } from 'lucide-react';
import { FEATURED_GAMES, GAME_MODES } from '@/games/portal/data';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function GamesHome({ locale }: { locale: string }) {
  const localePrefix = `/${locale}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden pt-28 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_-10%,rgba(34,211,238,0.25),transparent_60%),radial-gradient(900px_420px_at_85%_20%,rgba(124,58,237,0.22),transparent_65%),linear-gradient(180deg,#050713_0%,#0a1022_55%,#060812_100%)]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-28 right-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center space-y-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }} className="space-y-5">
            <Badge variant="info" size="sm" className="bg-cyan-500/15 text-cyan-200 border border-cyan-400/30">New Drop</Badge>
            <h1 className="text-5xl md:text-7xl font-[var(--font-lora)] font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200">
              Reflect Games
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-3xl mx-auto">
              Premium browser games with instant launch, sharp visuals, and competitive depth. No installs. Just play.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-slate-300">
            {['Zero Installs', 'Instant Load', 'Competitive Modes', 'Weekly Drops'].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 rounded-2xl px-10 text-base font-black w-full sm:w-auto bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_25px_60px_-30px_rgba(34,211,238,0.9)]">
              <a href="#featured">Explore Games</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl px-10 text-base font-black w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
              <a href={`${localePrefix}${FEATURED_GAMES[0].href}`}>Play Now</a>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Modes</p>
              <h2 className="text-3xl md:text-5xl font-[var(--font-lora)] font-semibold text-white">Modes Built For Momentum</h2>
            </div>
            <Badge variant="inverse" size="sm" className="text-slate-950">Curated</Badge>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAME_MODES.map((mode, idx) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-transform"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(180px_180px_at_20%_20%,rgba(34,211,238,0.2),transparent_60%)]" />
                <div className="relative space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-200">
                    <mode.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{mode.title}</h3>
                  <p className="text-sm text-slate-300">{mode.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-[var(--font-lora)] font-semibold text-white tracking-tight">Featured Games</h2>
              <p className="text-slate-300 mt-2">Play live titles or get ready for upcoming drops.</p>
            </div>
            <Badge variant="inverse" size="sm" className="text-slate-950">New Releases Weekly</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURED_GAMES.map((game, idx) => {
              const initials = game.title.split(' ').map((word) => word[0]).slice(0, 2).join('');
              return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/70 backdrop-blur-2xl hover:-translate-y-1 transition-transform"
                style={{ boxShadow: `0 30px 70px -50px ${game.accent}66` }}
              >
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${game.gradient}`} />
                <div className="relative p-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div
                      className="relative flex h-20 w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4"
                      style={{ boxShadow: `inset 0 0 30px ${game.accent}33` }}
                    >
                      <span className="text-2xl font-black text-white">{initials}</span>
                      <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{game.category}</span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">{game.category}</p>
                      <h3 className="text-2xl font-black text-white">{game.title}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
                      game.status === 'LIVE'
                        ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                        : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${game.status === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'}`} />
                      {game.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{game.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {game.status === 'LIVE' ? (
                      <Button
                        asChild
                        size="sm"
                        className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_18px_40px_-26px_rgba(34,211,238,0.9)]"
                      >
                        <a href={`${localePrefix}${game.href}`}>Play Now</a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-xl border-white/20 text-slate-300" disabled>
                        Coming Soon
                      </Button>
                    )}
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 flex items-center gap-2">
                      View Details <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Play Online</p>
              <h2 className="text-3xl md:text-5xl font-[var(--font-lora)] font-semibold text-white">
                Global-Grade Browser Gaming, Ready Instantly
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Reflect Games delivers premium online games optimized for every device. Launch in one tap, enjoy
                fast matchmaking, and stay immersed with smooth, neon-grade visuals built for competitive play.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {[
                  { label: 'Zero Installs', value: 'Instant Play' },
                  { label: 'Optimized', value: 'Mobile + Desktop' },
                  { label: 'Secure', value: 'Privacy First' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                    <p className="text-lg font-black text-white mt-2">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">FAQ</p>
                <div className="mt-4 space-y-4 text-sm text-slate-300">
                  <div>
                    <p className="font-bold text-white">Is Reflect Games free?</p>
                    <p>Yes. All games run in the browser with optional ads to keep the platform free.</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">Do I need to install anything?</p>
                    <p>No installs. Launch instantly on desktop, tablet, or mobile.</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">Can I play with friends?</p>
                    <p>Multiplayer and friend rooms are built in for select titles.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Performance</p>
                <p className="text-lg text-white font-semibold mt-2">Instant load times with adaptive quality</p>
                <p className="text-sm text-slate-300 mt-2">
                  Every game dynamically scales for your device to keep gameplay smooth and responsive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
