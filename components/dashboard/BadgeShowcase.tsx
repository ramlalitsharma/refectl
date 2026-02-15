'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle } from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string | Date | null;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: string;
    progress?: number;
}

interface BadgeShowcaseProps {
    badges?: Badge[];
}

interface BadgeData {
    badges: Badge[];
    stats: {
        total: number;
        earned: number;
        locked: number;
        completionRate: number;
        rarityCounts: {
            common: number;
            rare: number;
            epic: number;
            legendary: number;
        };
    };
}

const rarityColorsClass = {
    common: 'from-slate-500/20 to-slate-500/40 border-slate-500/20 text-slate-400',
    rare: 'from-elite-accent-blue/20 to-elite-accent-blue/40 border-elite-accent-blue/20 text-elite-accent-blue',
    epic: 'from-elite-accent-purple/20 to-elite-accent-purple/40 border-elite-accent-purple/20 text-elite-accent-purple',
    legendary: 'from-yellow-400/20 to-yellow-400/40 border-yellow-400/20 text-yellow-400',
};

const rarityText = {
    common: 'STANDARD',
    rare: 'REFINED',
    epic: 'PREMIUM',
    legendary: 'ULTIMATE',
};

export function BadgeShowcase({ badges: propBadges }: BadgeShowcaseProps = {}) {
    const [data, setData] = useState<BadgeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [newBadges, setNewBadges] = useState<Badge[]>([]);

    useEffect(() => {
        if (propBadges) {
            setData({
                badges: propBadges,
                stats: {
                    total: propBadges.length,
                    earned: propBadges.filter(b => b.earned).length,
                    locked: propBadges.filter(b => !b.earned).length,
                    completionRate: 0,
                    rarityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 },
                },
            });
            setLoading(false);
            return;
        }

        fetchBadges();
    }, [propBadges]);

    const fetchBadges = async () => {
        try {
            const res = await fetch('/api/badges/collection');
            if (res.status === 401) { setLoading(false); return; }
            if (!res.ok) throw new Error('Failed to fetch badges');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);
                await checkForNewBadges();
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching badges:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkForNewBadges = async () => {
        try {
            const res = await fetch('/api/badges/check', { method: 'POST' });
            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data.newBadges?.length > 0) {
                    setNewBadges(result.data.newBadges);
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#06b6d4', '#a855f7', '#10b981'],
                    });
                    setTimeout(() => setNewBadges([]), 5000);
                    fetchBadges();
                }
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
    };

    const badges = data?.badges || [];
    const stats = data?.stats || { total: 0, earned: 0, locked: 0, completionRate: 0, rarityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 } };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-4 bg-white/5 rounded-full" />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Asset Manifest Corrupted</div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Digital Assets</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.earned}/{stats.total} Tokens Verified</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-elite-accent-cyan uppercase tracking-widest">Integrity</div>
                    <div className="text-2xl font-black text-white tracking-tighter">{Math.round(stats.completionRate)}%</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-white/5 rounded-full overflow-hidden mb-10">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-elite-accent-cyan"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                />
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                {badges.map((badge, index) => (
                    <motion.button
                        key={badge.id}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-3xl border transition-all ${badge.earned
                            ? `bg-gradient-to-br ${rarityColorsClass[badge.rarity]} shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer`
                            : 'bg-white/5 border-white/5 opacity-20 cursor-not-allowed grayscale'
                            }`}
                        onClick={() => badge.earned && setSelectedBadge(badge)}
                        whileHover={badge.earned ? { scale: 1.1, y: -4, borderColor: 'rgba(255,255,255,0.2)' } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    >
                        {badge.icon}
                    </motion.button>
                ))}
            </div>

            {/* Rarity Legend */}
            <div className="grid grid-cols-4 gap-4 mt-10 pt-10 border-t border-white/5">
                {Object.entries(rarityText).map(([key, label]) => (
                    <div key={key} className="text-center group">
                        <div className={`mx-auto w-1.5 h-1.5 rounded-full mb-2 bg-current ${rarityColorsClass[key as keyof typeof rarityColorsClass].split(' ').pop()}`} />
                        <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</div>
                    </div>
                ))}
            </div>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            className={`glass-card-premium p-1 rounded-[3rem] max-w-sm w-full border-2 ${rarityColorsClass[selectedBadge.rarity].split(' ')[2]}`}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10 space-y-8 text-center bg-elite-bg rounded-inner overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="space-y-4">
                                    <motion.div
                                        className="text-7xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                    >
                                        {selectedBadge.icon}
                                    </motion.div>
                                    <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-white">
                                        {rarityText[selectedBadge.rarity]} CLASS
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedBadge.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{selectedBadge.description}</p>
                                </div>

                                {selectedBadge.earnedDate && (
                                    <div className="pt-8 border-t border-white/5">
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated On</div>
                                        <div className="text-xs font-black text-white font-mono">
                                            {new Date(selectedBadge.earnedDate).toLocaleDateString().toUpperCase()}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedBadge(null)}
                                    className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white rounded-2xl transition-all"
                                >
                                    Dismiss Terminal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
