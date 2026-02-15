'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const MARKETPLACE_ITEMS = [
    {
        id: 'ai-analyzer',
        name: 'Neural Insight Analyzer',
        category: 'Analysis Tool',
        description: 'Deep-dive AI analysis tool for learning patterns and knowledge gap prediction.',
        price: 49.99,
        status: 'paid',
        icon: '🧠',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
        tag: 'Popular'
    },
    {
        id: 'code-forge',
        name: 'Elite Code Forge',
        category: 'IDE Extension',
        description: 'Advanced code generation and debugging extension for Refectl-native projects.',
        price: 0,
        status: 'free',
        icon: '💻',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        tag: 'Universal'
    },
    {
        id: 'proctor-shield',
        name: 'Proctor Shield v2',
        category: 'Security',
        description: 'Enterprise-grade proctoring module with biometric verification capabilities.',
        price: 129.00,
        status: 'paid',
        icon: '🛡️',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        tag: 'Enterprise'
    },
    {
        id: 'study-pulse',
        name: 'StudyPulse Desktop',
        category: 'Productivity',
        description: 'A desktop companion app that syncs your Refectl tasks and sets focus timers.',
        price: 0,
        status: 'free',
        icon: '⏱️',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
        tag: 'Beta'
    }
];

export default function ShopPage() {
    const t = useTranslations('Common');
    const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

    const filteredItems = MARKETPLACE_ITEMS.filter(item =>
        filter === 'all' ? true : item.status === filter
    );

    return (
        <div className="min-h-screen bg-white dark:bg-elite-bg pb-12 sm:pb-16 lg:pb-20">
            {/* Hero Section */}
            <section className="relative h-[450px] sm:h-[500px] flex items-center justify-center overflow-hidden bg-slate-950">
                {/* Background Image with Parallax-like scale */}
                <motion.div
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1550741113-576a97b0d7d1?auto=format&fit=crop&w=1920&q=80"
                        alt="Marketplace Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* Animated Tech Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_80%)]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                </div>

                <div className="relative z-20 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-white uppercase tracking-tighter mb-4 flex flex-col items-center">
                            <span className="text-white drop-shadow-2xl">Elite</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 -mt-4 sm:-mt-8 md:-mt-10">Forge</span>
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.1em" }}
                        animate={{ opacity: 1, letterSpacing: "0.4em" }}
                        transition={{ delay: 0.3, duration: 1.5 }}
                        className="text-cyan-400/80 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.4em] max-w-2xl mx-auto border-y border-white/5 py-3 backdrop-blur-sm"
                    >
                        Digital Armament for the Modern Learner
                    </motion.p>
                </div>
            </section>

            {/* Filter Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-30">
                <div className="glass-card-premium rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mr-4 hidden sm:block">Filter Registry</span>
                        <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                            <Button
                                variant={filter === 'all' ? 'inverse' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('all')}
                                className={`touch-target-sm rounded-xl px-6 py-2 transition-all duration-300 font-black uppercase text-[10px] tracking-widest ${filter === 'all' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                All Assets
                            </Button>
                            <Button
                                variant={filter === 'free' ? 'inverse' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('free')}
                                className={`touch-target-sm rounded-xl px-6 py-2 transition-all duration-300 font-black uppercase text-[10px] tracking-widest ${filter === 'free' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                Open Source
                            </Button>
                            <Button
                                variant={filter === 'paid' ? 'inverse' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('paid')}
                                className={`touch-target-sm rounded-xl px-6 py-2 transition-all duration-300 font-black uppercase text-[10px] tracking-widest ${filter === 'paid' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                Premium
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                        <div className="text-[10px] font-black uppercase text-teal-400 tracking-[0.2em] flex flex-col items-end">
                            <span className="text-white text-lg leading-none mb-1">{filteredItems.length}</span>
                            <span>Items in Archive</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {filteredItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="group"
                        >
                            <div className="glass-card-premium rounded-[2.5rem] overflow-hidden border-white/5 h-full flex flex-col transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(34,211,238,0.2)] hover:border-cyan-500/20">
                                <div className="relative h-56 overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-white shadow-2xl">
                                        {item.tag}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60" />
                                </div>

                                <div className="p-8 flex-1 flex flex-col bg-slate-900/40">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">{item.icon}</div>
                                        <span className="text-[10px] uppercase font-black text-teal-400 tracking-[0.2em]">{item.category}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 leading-tight group-hover:text-cyan-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.1em] mb-1">Standard Issue</span>
                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                {item.price === 0 ? 'FREE' : `$${item.price}`}
                                            </span>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="rounded-2xl px-8 bg-cyan-500 text-slate-950 hover:bg-white hover:scale-105 transition-all duration-300 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-500/20"
                                        >
                                            Initialize
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Callout */}
            <section className="container mx-auto px-4 mt-24 mb-12">
                <div className="glass-card-premium rounded-[4rem] p-16 text-center border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-indigo-600/10 opacity-50" />
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />

                    <div className="relative z-10">
                        <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                            Forging New <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Digital Assets</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg font-medium leading-relaxed">
                            Are you an architect of the digital age? Join 500+ elite vendors listing their specialized tools and neural modules on the Forge.
                        </p>
                        <Button className="rounded-2xl px-12 py-8 bg-white text-slate-950 hover:bg-cyan-500 hover:text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all duration-300">
                            Partner Registration
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
