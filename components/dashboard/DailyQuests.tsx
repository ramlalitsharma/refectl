'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle, BookOpen, Clock, Flame, Target, Video } from 'lucide-react';

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
                    setCelebrateBonus(true);
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.6 },
                        colors: ['#06b6d4', '#a855f7', '#10b981'],
                    });

                    setTimeout(() => setCelebrateBonus(false), 3000);
                    fetchQuests();
                }
            }
        } catch (error) {
            console.error('Error claiming bonus:', error);
        }
    };

    const quests = data?.quests || [];
    const stats = data?.stats || { completed: 0, total: 0, earnedXP: 0, possibleXP: 0, completionRate: 0 };
    const getQuestIcon = (quest: Quest) => {
        switch (quest.type) {
            case 'quiz':
                return <Target className="h-7 w-7 text-elite-accent-cyan" />;
            case 'study_time':
                return <Clock className="h-7 w-7 text-elite-accent-purple" />;
            case 'video':
                return <Video className="h-7 w-7 text-emerald-400" />;
            case 'course':
                return <BookOpen className="h-7 w-7 text-amber-400" />;
            case 'streak':
                return <Flame className="h-7 w-7 text-orange-400" />;
            default:
                return <span className="text-lg">{quest.icon}</span>;
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-16 bg-white/5 rounded-2xl" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl" />
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
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Quest Synchronization Severed</div>
            </div>
        );
    }

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Active Objectives</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.completed}/{stats.total} Operations Verified</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-elite-accent-purple uppercase tracking-widest">Efficiency</div>
                    <div className="text-2xl font-black text-white tracking-tighter">{Math.round((stats.earnedXP / (stats.possibleXP || 1)) * 100)}%</div>
                </div>
            </div>

            {/* Quest List */}
            <div className="space-y-3">
                {quests.map((quest, index) => {
                    const progressPercent = (quest.progress / quest.total) * 100;

                    return (
                        <motion.div
                            key={quest.id}
                            className={`p-5 rounded-2xl border transition-all ${quest.completed
                                ? 'bg-elite-accent-emerald/5 border-elite-accent-emerald/20 opacity-60'
                                : 'bg-white/5 border-white/5 hover:border-elite-accent-cyan/20'
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-6">
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                                    {getQuestIcon(quest)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="truncate">
                                            <div className={`font-black uppercase tracking-widest text-xs ${quest.completed ? 'text-elite-accent-emerald line-through' : 'text-white'}`}>
                                                {quest.title}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{quest.description}</div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white whitespace-nowrap">
                                            <span className="text-elite-accent-cyan">+{quest.xpReward}</span>
                                            <span className="opacity-40">XP</span>
                                        </div>
                                    </div>

                                    {!quest.completed && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Telemetry</span>
                                                <span>{quest.progress} / {quest.total}</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-elite-accent-cyan"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercent}%` }}
                                                    transition={{ duration: 1, ease: 'circOut' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {quest.completed && (
                                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-elite-accent-emerald">
                                            Verified // Decrypted
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Completion Terminal */}
            <div className="mt-8 pt-8 border-t border-white/5">
                {stats.completed === stats.total ? (
                    <div className="p-6 rounded-2xl bg-elite-accent-emerald/5 border border-elite-accent-emerald/20 text-center space-y-2">
                        <div className="text-[10px] font-black text-elite-accent-emerald uppercase tracking-[0.4em]">Protocol Success</div>
                        <div className="text-sm font-black text-white uppercase tracking-widest">
                            {data?.bonusAwarded ? 'Full Synergy Achieved' : 'Initializing Bonus Payload...'}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Achieve full synchronization for <span className="text-elite-accent-purple">+{Math.round(stats.possibleXP * 0.2)} XP</span> surge
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
