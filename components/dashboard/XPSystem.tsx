'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle, FileText, Flame, GraduationCap, Target, Zap } from 'lucide-react';

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
    if (level >= 50) return 'CENTURION';
    if (level >= 40) return 'ARCHITECT';
    if (level >= 30) return 'ORACLE';
    if (level >= 20) return 'VANGUARD';
    if (level >= 10) return 'INITIATE';
    return 'NEOPHYTE';
};

const getLevelColorClass = (level: number) => {
    if (level >= 50) return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
    if (level >= 40) return 'text-elite-accent-purple border-elite-accent-purple/20 bg-elite-accent-purple/10';
    if (level >= 30) return 'text-elite-accent-cyan border-elite-accent-cyan/20 bg-elite-accent-cyan/10';
    if (level >= 20) return 'text-elite-accent-emerald border-elite-accent-emerald/20 bg-elite-accent-emerald/10';
    if (level >= 10) return 'text-orange-400 border-orange-400/20 bg-orange-400/10';
    return 'text-white border-white/20 bg-white/10';
};

export function XPSystem({ currentXP: propXP, currentLevel: propLevel }: XPSystemProps) {
    const [data, setData] = useState<XPData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        if (propXP !== undefined && propLevel !== undefined) {
            setTimeout(() => setLoading(false), 0);
            return;
        }

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

    const currentXP = propXP ?? data?.currentXP ?? 0;
    const currentLevel = propLevel ?? data?.currentLevel ?? 1;
    const levelInfo = data?.levelInfo;

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
            colors: ['#06b6d4', '#a855f7', '#10b981', '#ffffff'],
        });
        setTimeout(() => setShowLevelUp(false), 3000);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-24 bg-white/5 rounded-[2rem]" />
                <div className="h-4 bg-white/5 rounded-full" />
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl" />
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
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">XP Synchrony Failed</div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />

            {/* Level Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                    <motion.div
                        className={`w-20 h-20 rounded-[2rem] border-2 flex flex-col items-center justify-center ${getLevelColorClass(currentLevel)} shadow-lg`}
                        whileHover={{ scale: 1.05, rotate: -2 }}
                    >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Tier</span>
                        <span className="text-3xl font-black">{currentLevel}</span>
                    </motion.div>
                    <div>
                        <div className="text-xl font-black text-white uppercase tracking-widest leading-none mb-1">{getLevelTitle(currentLevel)}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Synchronization Established</div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-3xl font-black text-white font-mono tracking-tighter">{currentXP.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aggregate XP</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Threshold Integration</span>
                    <span className="text-white">{Math.round(progressPercent)}% Manifested</span>
                </div>

                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-elite-accent-cyan to-elite-accent-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, ease: 'circOut' }}
                    />
                </div>

                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                    <span>{xpInCurrentLevel} / {xpNeededForNextLevel} Delta</span>
                    <span className="text-elite-accent-cyan">-{xpNeededForNextLevel - xpInCurrentLevel} XP to Progression</span>
                </div>
            </div>

            {/* XP Earning Tips */}
            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                {[
                    { icon: <FileText className="h-6 w-6 text-slate-300" />, xp: '+50', label: 'CYCLE COMPLETED' },
                    { icon: <Target className="h-6 w-6 text-emerald-400" />, xp: '+100', label: 'PERFECT FEEDBACK' },
                    { icon: <Flame className="h-6 w-6 text-orange-400" />, xp: '+25', label: 'DAILY STREAK' },
                    { icon: <GraduationCap className="h-6 w-6 text-elite-accent-purple" />, xp: '+200', label: 'DOMAIN MASTERY' }
                ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group/tip hover:border-white/20 transition-all">
                        <span className="text-2xl grayscale group-hover/tip:grayscale-0 transition-all">{tip.icon}</span>
                        <div>
                            <div className="text-xs font-black text-white uppercase tracking-widest">{tip.xp} XP</div>
                            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{tip.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Demo Button */}
            <button
                onClick={handleLevelUpDemo}
                className="w-full mt-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
            >
                Preview Evolution Event
            </button>

            {/* Level Up Modal */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-center space-y-8">
                            <motion.div
                                className="w-24 h-24 rounded-[2rem] border-4 border-elite-accent-cyan flex items-center justify-center text-4xl mx-auto shadow-[0_0_50px_rgba(6,182,212,0.4)]"
                                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Zap className="h-10 w-10 text-elite-accent-cyan" />
                            </motion.div>
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-elite-accent-cyan uppercase tracking-[0.8em]">Level Ascended</div>
                                <div className="text-6xl font-black text-white tracking-tighter">TIER {currentLevel + 1}</div>
                                <div className="text-xl font-black text-white uppercase tracking-widest opacity-60">{getLevelTitle(currentLevel + 1)}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
