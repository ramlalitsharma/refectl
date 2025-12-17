'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Quest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    progress: number;
    total: number;
    completed: boolean;
    icon: string;
    type: 'quiz' | 'study_time' | 'video' | 'course' | 'streak';
}

interface DailyQuestsProps {
    quests?: Quest[];
}

interface QuestsData {
    quests: Quest[];
    stats: {
        completed: number;
        total: number;
        earnedXP: number;
        possibleXP: number;
        completionRate: number;
    };
    bonusAwarded: boolean;
}

export function DailyQuests({ quests: propQuests }: DailyQuestsProps = {}) {
    const [data, setData] = useState<QuestsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [celebrateBonus, setCelebrateBonus] = useState(false);

    useEffect(() => {
        // If props provided, use them
        if (propQuests) {
            setData({
                quests: propQuests,
                stats: {
                    completed: propQuests.filter(q => q.completed).length,
                    total: propQuests.length,
                    earnedXP: propQuests.reduce((sum, q) => sum + (q.completed ? q.xpReward : 0), 0),
                    possibleXP: propQuests.reduce((sum, q) => sum + q.xpReward, 0),
                    completionRate: 0,
                },
                bonusAwarded: false,
            });
            setLoading(false);
            return;
        }

        // Fetch from API
        fetchQuests();
    }, [propQuests]);

    const fetchQuests = async () => {
        try {
            const res = await fetch('/api/quests/daily');
            if (res.status === 401) { setLoading(false); return; }
            if (!res.ok) throw new Error('Failed to fetch quests');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);

                // Auto-check for bonus if all completed
                if (result.data.stats.completed === result.data.stats.total && !result.data.bonusAwarded) {
                    await claimBonus();
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching quests:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const claimBonus = async () => {
        try {
            const res = await fetch('/api/quests/daily/complete', {
                method: 'POST',
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success && !result.data.alreadyAwarded) {
                    // Celebration!
                    setCelebrateBonus(true);
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.6 },
                        colors: ['#10b981', '#34d399', '#6ee7b7'],
                    });

                    setTimeout(() => setCelebrateBonus(false), 3000);

                    // Refresh quests
                    fetchQuests();
                }
            }
        } catch (error) {
            console.error('Error claiming bonus:', error);
        }
    };

    const quests = data?.quests || [];
    const stats = data?.stats || { completed: 0, total: 0, earnedXP: 0, possibleXP: 0, completionRate: 0 };

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        ✨ Daily Quests
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-16 bg-purple-100 rounded-lg animate-pulse" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
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
                        <div className="text-sm font-medium text-red-600">Failed to load daily quests</div>
                        <div className="text-xs text-red-500">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                    <span>✨ Daily Quests</span>
                    <span className="text-sm font-normal text-slate-500 normal-case">
                        {stats.completed}/{stats.total} Complete
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Quest Progress Overview */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <div>
                        <div className="text-sm text-purple-700 font-medium">Today's Progress</div>
                        <div className="text-xs text-purple-600 mt-1">
                            Earned {stats.earnedXP} / {stats.possibleXP} XP
                        </div>
                    </div>
                    <div className="text-3xl font-black text-purple-600">
                        {Math.round((stats.earnedXP / stats.possibleXP) * 100) || 0}%
                    </div>
                </div>

                {/* Quest List */}
                <div className="space-y-2">
                    {quests.map((quest, index) => {
                        const progressPercent = (quest.progress / quest.total) * 100;

                        return (
                            <motion.div
                                key={quest.id}
                                className={`p-4 rounded-xl border-2 transition-all ${quest.completed
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-white border-slate-200 hover:border-teal-300'
                                    }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: quest.completed ? 1 : 1.02 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">{quest.icon}</div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className={`font-semibold ${quest.completed ? 'text-green-700 line-through' : 'text-slate-800'}`}>
                                                    {quest.title}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">{quest.description}</div>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold whitespace-nowrap ml-2">
                                                <span>⭐</span>
                                                <span>+{quest.xpReward} XP</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {!quest.completed && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">Progress</span>
                                                    <span className="font-medium text-slate-700">
                                                        {quest.progress} / {quest.total}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercent}%` }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Completed Checkmark */}
                                        {quest.completed && (
                                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                <span>✓</span>
                                                <span>Completed!</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Completion Message */}
                {stats.completed === stats.total ? (
                    <AnimatePresence>
                        <motion.div
                            className="p-4 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="text-2xl mb-2">🎉</div>
                            <div className="font-bold text-green-700">All Quests Complete!</div>
                            <div className="text-sm text-green-600 mt-1">
                                {data?.bonusAwarded
                                    ? 'Bonus XP awarded! Check back tomorrow.'
                                    : 'Claiming bonus XP...'}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="text-center text-sm text-slate-500 pt-2">
                        Complete all quests to earn bonus {Math.round(stats.possibleXP * 0.2)} XP!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
