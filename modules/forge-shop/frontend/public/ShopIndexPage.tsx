'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Bot, Code2, BarChart3, Palette, Shield,
  ArrowRight, Star, Globe, Users, CheckCircle2,
  Sparkles, Cpu, Layers, TrendingUp, Lock, Rocket,
  Braces, Gauge, Search, Monitor, GitBranch, Package,
  FolderOpen, Play, Save
} from 'lucide-react';

/* ─────────────── DATA ─────────────── */
const CATEGORIES = [
  { id: 'all', label: 'All Tools', count: 12 },
  { id: 'coding', label: 'Dev Tools', count: 4 },
  { id: 'ai', label: 'AI Agents', count: 3 },
  { id: 'automation', label: 'Automation', count: 3 },
  { id: 'workspace', label: 'Workspace', count: 2 },
];

const TOOLS = [
  {
    id: 'code-editor',
    name: 'forgeIDE',
    tagline: 'Full IDE with local file system & multi-language support',
    icon: Code2,
    category: 'coding',
    badge: 'FREE',
    badgeColor: 'from-cyan-500 to-blue-600',
    gradient: 'from-cyan-600/20 via-blue-600/10 to-transparent',
    glowColor: 'shadow-cyan-500/20',
    borderGlow: 'hover:border-cyan-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.9, reviews: 3240,
    features: ['Local file system access', 'AI-powered autocomplete', 'Multi-tab workspace', 'Live preview & console'],
    href: '/shop/code-editor',
    live: true,
  },
  {
    id: 'playground',
    name: 'Code Playground',
    tagline: 'Run JS, Python, HTML instantly in browser sandboxes',
    icon: Play,
    category: 'coding',
    badge: 'FREE',
    badgeColor: 'from-emerald-500 to-teal-600',
    gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    glowColor: 'shadow-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.8, reviews: 5110,
    features: ['30+ languages', 'Real-time output', 'Save to local disk', 'Share via URL'],
    href: '/shop/code-editor',
    live: true,
  },
  {
    id: 'snippet-vault',
    name: 'Snippet Vault',
    tagline: 'Save and organize code snippets across projects',
    icon: Braces,
    category: 'coding',
    badge: 'FREE',
    badgeColor: 'from-violet-500 to-purple-600',
    gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
    glowColor: 'shadow-violet-500/20',
    borderGlow: 'hover:border-violet-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.7, reviews: 892,
    features: ['Syntax highlighting', 'Tag & search', 'LocalStorage persist', 'Export as file'],
    href: '/shop/code-editor',
    live: true,
  },
  {
    id: 'neural-agent',
    name: 'Neural Agent Forge',
    tagline: 'Multi-model AI orchestration engine',
    icon: Bot,
    category: 'ai',
    badge: 'ULTRA',
    badgeColor: 'from-violet-500 to-purple-600',
    gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
    glowColor: 'shadow-violet-500/20',
    borderGlow: 'hover:border-violet-500/50',
    price: { amount: 199, period: 'one-time', suffix: '' },
    rating: 4.9, reviews: 203,
    features: ['Deploy specialized AI agents', 'Cross-model memory persistence', 'Live web + API data access', 'Custom tool chaining'],
    href: '#',
    live: false,
  },
  {
    id: 'auto-editorial',
    name: 'Autonomous Editorial',
    tagline: 'AI-powered content pipeline at scale',
    icon: Sparkles,
    category: 'automation',
    badge: 'POPULAR',
    badgeColor: 'from-emerald-500 to-teal-600',
    gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
    glowColor: 'shadow-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/50',
    price: { amount: 79, period: '/mo', suffix: '' },
    rating: 4.8, reviews: 511,
    features: ['Research-to-publish automation', 'SEO optimization engine', 'Multi-language sync', 'Scheduled deployment'],
    href: '#',
    live: false,
  },
  {
    id: 'market-pulse',
    name: 'Market Pulse Analyzer',
    tagline: 'Neural trend prediction & intelligence',
    icon: TrendingUp,
    category: 'ai',
    badge: 'NEW',
    badgeColor: 'from-amber-500 to-orange-600',
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    glowColor: 'shadow-amber-500/20',
    borderGlow: 'hover:border-amber-500/50',
    price: { amount: 249, period: 'one-time', suffix: '' },
    rating: 4.9, reviews: 87,
    features: ['Real-time sentiment analysis', 'Competitor signal tracking', 'Predictive trend models', 'Custom alert webhooks'],
    href: '#',
    live: false,
  },
  {
    id: 'whiteboard',
    name: 'Strategic Whiteboard',
    tagline: 'Infinite canvas for deep thinking',
    icon: Palette,
    category: 'workspace',
    badge: 'FREE',
    badgeColor: 'from-pink-500 to-rose-600',
    gradient: 'from-pink-600/20 via-rose-600/10 to-transparent',
    glowColor: 'shadow-pink-500/20',
    borderGlow: 'hover:border-pink-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.6, reviews: 882,
    features: ['Infinite scalable canvas', 'AI diagram generation', 'Real-time multiplayer', 'Smart shape recognition'],
    href: '/shop/whiteboard',
    live: true,
  },
  {
    id: 'workflow-engine',
    name: 'Workflow Forge Engine',
    tagline: 'Build no-code automation pipelines',
    icon: Layers,
    category: 'automation',
    badge: 'ULTRA',
    badgeColor: 'from-violet-500 to-indigo-600',
    gradient: 'from-indigo-600/20 via-violet-600/10 to-transparent',
    glowColor: 'shadow-indigo-500/20',
    borderGlow: 'hover:border-indigo-500/50',
    price: { amount: 129, period: '/mo', suffix: '' },
    rating: 4.8, reviews: 346,
    features: ['Visual pipeline builder', '500+ native integrations', 'Conditional logic branching', 'Real-time monitoring'],
    href: '#',
    live: false,
  },
  {
    id: 'proctor-shield',
    name: 'Proctor Shield Pro',
    tagline: 'Enterprise-grade exam security suite',
    icon: Shield,
    category: 'ai',
    badge: 'ENTERPRISE',
    badgeColor: 'from-slate-500 to-slate-700',
    gradient: 'from-slate-600/20 via-slate-700/10 to-transparent',
    glowColor: 'shadow-slate-500/20',
    borderGlow: 'hover:border-slate-500/50',
    price: { amount: 129, period: '/mo', suffix: '' },
    rating: 5.0, reviews: 62,
    features: ['Biometric identity verification', 'Tamper-proof session recording', 'AI behavior analysis', 'FERPA / GDPR compliant'],
    href: '#',
    live: false,
  },
  {
    id: 'analytics-suite',
    name: 'Learning Analytics Suite',
    tagline: 'Deep insight into every learner journey',
    icon: BarChart3,
    category: 'automation',
    badge: 'PRO',
    badgeColor: 'from-blue-500 to-cyan-600',
    gradient: 'from-blue-600/20 via-cyan-600/10 to-transparent',
    glowColor: 'shadow-blue-500/20',
    borderGlow: 'hover:border-blue-500/50',
    price: { amount: 59, period: '/mo', suffix: '' },
    rating: 4.7, reviews: 419,
    features: ['Predictive dropout alerts', 'Cohort performance tracking', 'Custom KPI dashboards', 'CSV & API export'],
    href: '#',
    live: false,
  },
  {
    id: 'perf-monitor',
    name: 'Dev Performance Monitor',
    tagline: 'Profile and optimize your code at scale',
    icon: Gauge,
    category: 'coding',
    badge: 'FREE',
    badgeColor: 'from-rose-500 to-red-600',
    gradient: 'from-rose-600/20 via-red-600/10 to-transparent',
    glowColor: 'shadow-rose-500/20',
    borderGlow: 'hover:border-rose-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.6, reviews: 277,
    features: ['CPU & memory profiling', 'Render time analysis', 'Network waterfall', 'Export JSON reports'],
    href: '#',
    live: false,
  },
  {
    id: 'dependency-graph',
    name: 'Dependency Graph Viewer',
    tagline: 'Visualize and audit your package tree',
    icon: Package,
    category: 'coding',
    badge: 'FREE',
    badgeColor: 'from-orange-500 to-yellow-600',
    gradient: 'from-orange-600/20 via-yellow-600/10 to-transparent',
    glowColor: 'shadow-orange-500/20',
    borderGlow: 'hover:border-orange-500/50',
    price: { amount: 0, period: '', suffix: 'Free' },
    rating: 4.5, reviews: 193,
    features: ['npm / yarn / pnpm support', 'Vulnerability overlay', 'Tree shaking hints', 'One-click update PRs'],
    href: '#',
    live: false,
  },
];

const STATS = [
  { icon: Users, value: '140K+', label: 'Active Devs' },
  { icon: Globe, value: '80+', label: 'Countries' },
  { icon: Rocket, value: '99.9%', label: 'Uptime SLA' },
  { icon: Lock, value: 'SOC 2', label: 'Certified' },
];

const HERO_PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  x: (i * 17) % 100,
  y: (i * 29) % 100,
  delay: i * 0.3,
  size: i % 3 === 0 ? 2 : 1,
}));

/* ── Tool Card ── */
function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const Icon = tool.icon;
  const isFree = tool.price.amount === 0;

  const handleOpen = () => {
    if (tool.href && tool.href !== '#') {
      window.location.href = tool.href;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`group relative rounded-3xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 shadow-2xl ${tool.glowColor} ${tool.borderGlow}`}
    >
      {/* Gradient bg on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      {/* Top glow line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${tool.badgeColor} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />

      <div className="relative z-10 p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.badgeColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-[10px] font-black tracking-[0.2em] text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${tool.badgeColor} shadow-lg`}>
              {tool.badge}
            </span>
            {tool.live && (
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">{tool.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-5 leading-relaxed">{tool.tagline}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(tool.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-amber-400">{tool.rating}</span>
          <span className="text-xs text-slate-600">({tool.reviews.toLocaleString()})</span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-7">
          {tool.features.map(feat => (
            <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{feat}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div>
            {isFree ? (
              <span className="text-2xl font-black text-emerald-400">Free</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">${tool.price.amount}</span>
                {tool.price.period && <span className="text-sm text-slate-500">{tool.price.period}</span>}
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${tool.badgeColor} shadow-lg hover:shadow-xl hover:brightness-110 transition-all`}
          >
            {isFree ? 'Open Tool' : 'Get Access'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── PAGE ─────────────── */
export default function ForgeShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const filtered = TOOLS.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.features.some(f => f.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ════ HERO ════ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-emerald-600/8 blur-[100px] pointer-events-none" />

        {HERO_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-violet-400/30"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 4, height: p.size * 4 }}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 4 + p.delay, repeat: Infinity, repeatDelay: p.delay, ease: 'easeInOut' }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold tracking-[0.2em] uppercase mb-8"
          >
            <Cpu className="w-3.5 h-3.5" />Forge Shop — Elite Software Arsenal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl xl:text-8xl font-black leading-[0.95] tracking-tight mb-6"
          >
            <span className="text-white">Tools built for</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">the frontier</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI agents, automation pipelines, and elite developer tools — engineered to accelerate your mission from $0 to production in hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:brightness-110 transition-all"
            >
              <Zap className="w-5 h-5" />Browse All Tools
            </button>
            <Link href="/pricing" className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-base hover:bg-white/10 hover:border-white/20 transition-all">
              View Pricing<ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-left">
                  <div className="text-base font-black text-slate-900 dark:text-white leading-tight">{value}</div>
                  <div className="text-xs text-slate-500 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ════ TOOLS ════ */}
      <section id="tools-grid" className="px-4 md:px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">The Full Arsenal</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Pick a tool. Deploy in minutes. Scale without limits.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools…"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {CATEGORIES.map(cat => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 ${isActive
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat.label}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tool cards */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-24 text-slate-600">
                <Search className="w-10 h-10 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No tools found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ════ ENTERPRISE CTA ════ */}
      <section className="px-4 md:px-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-violet-500/20 bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-background p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 blur-[100px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold tracking-widest uppercase mb-6">
                <Rocket className="w-3.5 h-3.5" />Enterprise & Custom Builds
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5">Need something custom?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Our Forge engineers build bespoke AI agents, automation suites, and enterprise integrations tailored to your exact requirements.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/contact" className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-2xl shadow-violet-500/30 hover:brightness-110 transition-all">
                  <Zap className="w-5 h-5" />Request Custom Forge
                </Link>
                <Link href="/pricing" className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">
                  See Enterprise Plans
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
