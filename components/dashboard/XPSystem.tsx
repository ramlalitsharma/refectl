'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface XPSystemProps {
    // Props are optional now - will fetch from API
    currentXP?: number;
    currentLevel?: number;
}

interface XPData {
    currentXP: number;
    currentLevel: number;
    levelInfo: {
        current: {
            level: number;
            title: string;
            color: string;
        };
        next: {
            level: number;
            title: string;
            color: string;
        };
        progressPercent: number;
        xpToNext: number;
    };
}

// XP required for each level (exponential growth)
const getXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

const getLevelTitle = (level: number) => {
    if (level >= 50) return '🏆 Grandmaster';
    if (level >= 40) return '💎 Master';
    if (level >= 30) return '👑 Expert';
    if (level >= 20) return '⭐ Advanced';
    if (level >= 10) return '🔥 Intermediate';
    return '🌱 Beginner';
};

const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-yellow-400 to-orange-500';
    if (level >= 40) return 'from-purple-400 to-pink-500';
    if (level >= 30) return 'from-blue-400 to-indigo-500';
    if (level >= 20) return 'from-green-400 to-teal-500';
    if (level >= 10) return 'from-orange-400 to-red-500';
    return 'from-slate-400 to-slate-500';
};

export function XPSystem({ currentXP: propXP, currentLevel: propLevel }: XPSystemProps) {
    const [data, setData] = useState<XPData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        // If props provided (for testing/fallback), use them
        if (propXP !== undefined && propLevel !== undefined) {
            setLoading(false);
            return;
        }

        // Otherwise fetch from API
        fetch('/api/user/stats/xp')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch XP data');
                return res.json();
            })
            .then(result => {
                if (result.success && result.data) {
                    setData(result.data);
                    setError(null);
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(err => {
                console.error('Error fetching XP:', err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [propXP, propLevel]);

    // Use prop data or fetched data
    const currentXP = propXP ?? data?.currentXP ?? 0;
    const currentLevel = propLevel ?? data?.currentLevel ?? 1;
    const levelInfo = data?.levelInfo;

    // Calculate progress (use API data if available, otherwise calculate locally)
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = levelInfo?.progressPercent ?? ((xpInCurrentLevel / xpNeededForNextLevel) * 100);

    const handleLevelUpDemo = () => {
        setShowLevelUp(true);
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444'],
        });
        setTimeout(() => setShowLevelUp(false), 3000);
    };

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse ml-auto" />
                            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
                        </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
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
                    <div className="text-center space-y-3">
                        <div className="text-4xl">⚠️</div>
                        <div className="text-sm font-medium text-red-600">Failed to load XP data</div>
                        <div className="text-xs text-slate-500">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs text-teal-600 hover:text-teal-700 underline"
                        >
                            Retry
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90 overflow-hidden relative">
            <CardContent className="p-6 space-y-4">
                {/* Level Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center text-white font-black text-2xl shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {currentLevel}
                        </motion.div>
                        <div>
                            <div className="text-lg font-bold text-slate-800">{getLevelTitle(currentLevel)}</div>
                            <div className="text-sm text-slate-500">Level {currentLevel}</div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-black text-teal-600">{currentXP.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Total XP</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress to Level {currentLevel + 1}</span>
                        <span className="font-semibold text-slate-700">{Math.round(progressPercent)}%</span>
                    </div>

                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getLevelColor(currentLevel + 1)} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
                        <span>{xpNeededForNextLevel - xpInCurrentLevel} XP to next level</span>
                    </div>
                </div>

                {/* XP Earning Tips */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-lg">📝</span>
                        <div>
                            <div className="font-semibold text-slate-700">+50 XP</div>
                            <div className="text-slate-500">Complete Quiz</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-lg">🎯</span>
                        <div>
                            <div className="font-semibold text-slate-700">+100 XP</div>
                            <div className="text-slate-500">Perfect Score</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-lg">🔥</span>
                        <div>
                            <div className="font-semibold text-slate-700">+25 XP</div>
                            <div className="text-slate-500">Daily Streak</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-lg">🎓</span>
                        <div>
                            <div className="font-semibold text-slate-700">+200 XP</div>
                            <div className="text-slate-500">Finish Course</div>
                        </div>
                    </div>
                </div>

                {/* Demo Button */}
                <button
                    onClick={handleLevelUpDemo}
                    className="w-full py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
                >
                    🎉 Preview Level Up Animation
                </button>
            </CardContent>

            {/* Level Up Modal */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-yellow-400/95 to-orange-500/95 flex items-center justify-center z-50"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                className="text-6xl"
                                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6 }}
                            >
                                🎉
                            </motion.div>
                            <div>
                                <div className="text-4xl font-black text-white">LEVEL UP!</div>
                                <div className="text-2xl font-bold text-white/90 mt-2">Level {currentLevel + 1}</div>
                                <div className="text-lg text-white/80 mt-1">{getLevelTitle(currentLevel + 1)}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
