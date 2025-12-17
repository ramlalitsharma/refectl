'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StudyStreakProps {
    currentStreak?: number;
    longestStreak?: number;
    lastStudyDate?: string;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
}

export function StudyStreak(props: StudyStreakProps = {}) {
    const [data, setData] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // If props provided, use them
        if (props.currentStreak !== undefined) {
            setData({
                currentStreak: props.currentStreak,
                longestStreak: props.longestStreak || 0,
                lastStudyDate: props.lastStudyDate || '',
            });
            setLoading(false);
            return;
        }

        // Fetch from API
        fetch('/api/user/stats/streak')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch streak data');
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
                console.error('Error fetching streak:', err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [props.currentStreak, props.longestStreak, props.lastStudyDate]);

    const currentStreak = data?.currentStreak ?? 0;
    const longestStreak = data?.longestStreak ?? 0;
    const lastStudyDate = data?.lastStudyDate;

    useEffect(() => {
        // Celebrate milestones
        if (currentStreak > 0 && currentStreak % 7 === 0 && !showConfetti) {
            setShowConfetti(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#14b8a6', '#10b981', '#f59e0b'],
            });

            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [currentStreak, showConfetti]);

    const isNewRecord = currentStreak > longestStreak;

    // Loading state
    if (loading) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-orange-200 rounded animate-pulse" />
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-200 rounded animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-8 w-16 bg-orange-200 rounded animate-pulse" />
                                    <div className="h-3 w-12 bg-orange-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-orange-200 rounded animate-pulse ml-auto" />
                            <div className="h-6 w-12 bg-orange-200 rounded animate-pulse ml-auto" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-6">
                    <div className="text-center space-y-2">
                        <div className="text-3xl">⚠️</div>
                        <div className="text-sm font-medium text-orange-700">Failed to load streak data</div>
                        <div className="text-xs text-orange-600">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="text-sm uppercase tracking-wide text-orange-700 font-semibold">
                            Study Streak
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.div
                                className="text-5xl"
                                animate={{
                                    scale: currentStreak > 0 ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: currentStreak > 0 ? Infinity : 0,
                                    repeatDelay: 2,
                                }}
                            >
                                🔥
                            </motion.div>

                            <div>
                                <motion.div
                                    className="text-4xl font-black text-orange-600"
                                    key={currentStreak}
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    {currentStreak}
                                </motion.div>
                                <div className="text-sm text-orange-700">
                                    {currentStreak === 1 ? 'day' : 'days'}
                                </div>
                            </div>
                        </div>

                        {isNewRecord && currentStreak > 0 && (
                            <motion.div
                                className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 text-xs font-bold px-2 py-1 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                <span>🎉</span>
                                <span>New Record!</span>
                            </motion.div>
                        )}
                    </div>

                    <div className="text-right space-y-1">
                        <div className="text-xs text-orange-600 uppercase tracking-wide">
                            Personal Best
                        </div>
                        <div className="text-2xl font-bold text-orange-700">
                            {Math.max(longestStreak, currentStreak)}
                        </div>
                        {lastStudyDate && (
                            <div className="text-xs text-orange-500">
                                Last: {new Date(lastStudyDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Motivational message */}
                <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="text-sm text-orange-700">
                        {currentStreak === 0 && "Start your streak today! 💪"}
                        {currentStreak > 0 && currentStreak < 3 && "Keep it up! You're building momentum 🚀"}
                        {currentStreak >= 3 && currentStreak < 7 && "You're on fire! Don't break the chain 🔥"}
                        {currentStreak >= 7 && currentStreak < 14 && "Amazing dedication! Keep going 🌟"}
                        {currentStreak >= 14 && currentStreak < 30 && "You're unstoppable! 💎"}
                        {currentStreak >= 30 && "Legend status! Incredible consistency 👑"}
                    </div>
                </div>
            </CardContent>

            {/* Animated background effect */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 to-orange-200/50 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </AnimatePresence>
        </Card>
    );
}
