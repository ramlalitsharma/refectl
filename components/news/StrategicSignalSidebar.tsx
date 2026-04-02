'use client';

import { Activity, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignalItem {
    id: string;
    title: string;
    impact: number;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    category: string;
}

interface StrategicSignalSidebarProps {
    signals: SignalItem[];
    entities: string[];
}

export function StrategicSignalSidebar({ signals = [], entities = [] }: StrategicSignalSidebarProps) {
    const sortedSignals = [...(signals || [])].sort((a, b) => b.impact - a.impact).slice(0, 5);

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'Bullish': return <TrendingUp size={14} className="text-emerald-500" />;
            case 'Bearish': return <TrendingDown size={14} className="text-rose-500" />;
            default: return <Minus size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="strategic-signal-sidebar flex flex-col gap-8">
            {/* 1. Impact Pulse */}
            <section className="signal-section">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-red-700" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Strategic Impact Pulse</h3>
                </div>
                <div className="flex flex-col gap-4">
                    {sortedSignals.map((signal) => (
                        <motion.div 
                            key={signal.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group cursor-default"
                        >
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider font-mono">
                                    {signal.category}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {getSentimentIcon(signal.sentiment)}
                                    <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white">
                                        {signal.impact}%
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-[12px] font-bold leading-tight text-slate-800 dark:text-slate-200 group-hover:text-red-700 transition-colors line-clamp-2">
                                {signal.title}
                            </h4>
                            <div className="mt-2 h-0.5 w-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${signal.impact}%` }}
                                    className={`h-full ${signal.sentiment === 'Bullish' ? 'bg-emerald-500' : signal.sentiment === 'Bearish' ? 'bg-rose-500' : 'bg-slate-400'}`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 2. Entity Watchlist */}
            <section className="entity-section">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-red-700" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Entity Watchlist</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {entities.slice(0, 12).map((entity, i) => (
                        <span 
                            key={i}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-md hover:bg-red-700/10 hover:border-red-700/30 hover:text-red-700 transition-all cursor-crosshair"
                        >
                            {entity}
                        </span>
                    ))}
                </div>
            </section>

            {/* 3. Global Sentiment Meter */}
            <section className="sentiment-meter">
                 <div className="p-4 rounded-xl bg-slate-950 border border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Network Sentiment</h4>
                    <div className="flex items-end justify-between gap-1 h-8">
                        {[40, 70, 45, 90, 65, 30, 85, 55, 95, 60].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                className="w-1 bg-gradient-to-t from-red-700 to-rose-400 rounded-full opacity-60"
                            />
                        ))}
                    </div>
                 </div>
            </section>
            {/* 4. Sponsored Intelligence (Revenue Strategy) */}
            <section className="sponsored-intel mt-4">
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 relative group cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500/10 text-amber-600 text-[7px] font-black uppercase tracking-tighter rounded-bl-lg">Sponsored</div>
                    <h5 className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-500 mb-1">Institutional Briefing</h5>
                    <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300 font-bold mb-3">Deploy your global capital with verified geopolitical risk intelligence.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-amber-500">Terai Times Capital</span>
                        <ArrowUpRight size={10} className="text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>
            </section>
        </div>
    );
}

// Internal icon helper
function ArrowUpRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
        </svg>
    );
}
