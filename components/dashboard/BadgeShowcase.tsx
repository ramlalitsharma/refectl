'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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

const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-pink-600',
    legendary: 'from-yellow-400 to-orange-500',
};

const rarityText = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
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
            if (res.status === 401) {
                // User session expired or invalid - silenty fail or redirect
                // For a dashboard component, typically we might want to redirect, 
                // but since the page already checks auth, this might be a race condition.
                // We'll just stop loading for now.
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch badges');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);

                // Auto-check for new badges
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
            const res = await fetch('/api/badges/check', {
                method: 'POST',
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data.newBadges?.length > 0) {
                    // Show celebration for new badges
                    setNewBadges(result.data.newBadges);
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444'],
                    });

                    setTimeout(() => setNewBadges([]), 5000);

                    // Refresh badge collection
                    fetchBadges();
                }
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
    };

    const badges = data?.badges || [];
    const stats = data?.stats || { total: 0, earned: 0, locked: 0, completionRate: 0, rarityCounts: { common: 0, rare: 0, epic: 0, legendary: 0 } };

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        🏅 Badge Collection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardContent className="p-6">
                    <div className="text-center space-y-2">
                        <div className="text-3xl">⚠️</div>
                        <div className="text-sm font-medium text-red-600">Failed to load badges</div>
                        <div className="text-xs text-red-500">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                        <span>🏅 Badge Collection</span>
                        <span className="text-sm font-normal text-slate-500 normal-case">
                            {stats.earned}/{stats.total} Unlocked
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Collection Progress</span>
                            <span className="font-semibold text-slate-700">
                                {Math.round(stats.completionRate)}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.completionRate}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>

                    {/* Badge Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {badges.map((badge, index) => (
                            <motion.button
                                key={badge.id}
                                className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${badge.earned
                                    ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg hover:shadow-xl cursor-pointer`
                                    : 'bg-slate-200 opacity-40 cursor-not-allowed grayscale'
                                    }`}
                                onClick={() => badge.earned && setSelectedBadge(badge)}
                                whileHover={badge.earned ? { scale: 1.1, rotate: 5 } : {}}
                                whileTap={badge.earned ? { scale: 0.95 } : {}}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {badge.icon}
                            </motion.button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200">
                        {Object.entries(rarityColors).map(([rarity, gradient]) => {
                            const count = stats.rarityCounts[rarity as keyof typeof stats.rarityCounts] || 0;
                            return (
                                <div key={rarity} className="text-center">
                                    <div className={`mx-auto w-8 h-8 rounded-full bg-gradient-to-br ${gradient} mb-1`} />
                                    <div className="text-xs font-semibold text-slate-700">{count}</div>
                                    <div className="text-xs text-slate-500 capitalize">{rarity}</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBadge(null)}
                        >
                            {/* Modal */}
                            <motion.div
                                className={`bg-gradient-to-br ${rarityColors[selectedBadge.rarity]} p-1 rounded-2xl max-w-md w-full`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white rounded-xl p-6 space-y-4">
                                    {/* Icon & Rarity */}
                                    <div className="text-center space-y-2">
                                        <motion.div
                                            className="text-8xl"
                                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {selectedBadge.icon}
                                        </motion.div>
                                        <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[selectedBadge.rarity]} text-white text-xs font-bold uppercase`}>
                                            {rarityText[selectedBadge.rarity]}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-2xl font-bold text-slate-800">{selectedBadge.name}</h3>
                                        <p className="text-slate-600">{selectedBadge.description}</p>

                                        {selectedBadge.earnedDate && (
                                            <div className="pt-3 border-t border-slate-200">
                                                <div className="text-sm text-slate-500">Earned on</div>
                                                <div className="text-sm font-semibold text-slate-700">
                                                    {new Date(selectedBadge.earnedDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                                                {selectedBadge.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setSelectedBadge(null)}
                                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
