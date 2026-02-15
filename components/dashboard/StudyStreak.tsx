'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle, Flame, Sparkles } from 'lucide-react';

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
            setTimeout(() => {
                setData({
                    currentStreak: props.currentStreak!,
                    longestStreak: props.longestStreak || 0,
                    lastStudyDate: props.lastStudyDate || '',
                });
                setLoading(false);
            }, 0);
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
            setTimeout(() => setShowConfetti(true), 0);
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
            <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 h-full animate-pulse">
                <div className="h-4 w-24 bg-white/5 rounded-full mb-6" />
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5" />
                    <div className="space-y-3">
                        <div className="h-10 w-24 bg-white/5 rounded-xl" />
                        <div className="h-4 w-16 bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card-premium rounded-[2.5rem] p-8 border border-red-500/20 bg-red-500/5 h-full">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <AlertTriangle className="h-9 w-9 text-red-500" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Telemetry Sync Failed</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">
                            Momentum Tracker
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Temporal Pulse</h3>
                    </div>

                    <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">
                            Node Best
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                            {Math.max(longestStreak, currentStreak)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 mb-10">
                    <motion.div
                        className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-2xl relative overflow-hidden"
                        animate={{
                            boxShadow: currentStreak > 0 ? [
                                '0 0 0px rgba(6,182,212,0)',
                                '0 0 20px rgba(6,182,212,0.2)',
                                '0 0 0px rgba(6,182,212,0)'
                            ] : 'none'
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-elite-accent-cyan/10 to-transparent opacity-50" />
                        <span className="relative z-10">
                            <Flame className="h-8 w-8 text-elite-accent-cyan" />
                        </span>
                    </motion.div>

                    <div className="space-y-1">
                        <motion.div
                            className="text-6xl font-black text-white tracking-tighter leading-none"
                            key={currentStreak}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {currentStreak}
                        </motion.div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan">
                            Cycle Sync
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        {currentStreak === 0 && "Initialize your momentum relay. Begin session."}
                        {currentStreak > 0 && currentStreak < 3 && "Sustaining temporal link. Momentum detected."}
                        {currentStreak >= 3 && currentStreak < 7 && "High-priority focus active. Do not terminate relay."}
                        {currentStreak >= 7 && currentStreak < 14 && "Elite consistency established. Node status: Optimal."}
                        {currentStreak >= 14 && currentStreak < 30 && "Neural pathway recalibrated. Exceptional throughput."}
                        {currentStreak >= 30 && "Legend Protocol: Active. Reality variance minimal."}
                    </div>

                    {isNewRecord && currentStreak > 0 && (
                        <motion.div
                            className="inline-flex items-center gap-2 bg-elite-accent-cyan text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-elite-accent-cyan/20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Aesthetic Record Set</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Animated background effect */}
            <AnimatePresence>
                {showConfetti && (
                    <motion.div
                        className="absolute inset-0 bg-elite-accent-cyan/5 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
