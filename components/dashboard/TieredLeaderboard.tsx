'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { AlertTriangle, Award, Gem, Medal, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName?: string;
    avatar?: string;
    xp?: number;
    totalXP?: number;
    level: number;
    streak?: number;
    tier?: string;
    isCurrentUser?: boolean;
}

interface TierInfo {
    name: string;
    color: string;
    icon: ReactNode;
    textColor: string;
}

interface TieredLeaderboardProps {
    entries?: LeaderboardEntry[];
    currentUserRank?: number;
}

interface LeaderboardData {
    leaderboard: Array<LeaderboardEntry & { tier: TierInfo }>;
    totalUsers: number;
}

interface UserRankData {
    rank: number;
    tier: TierInfo;
    xp: number;
    level: number;
    percentile: number;
    surrounding: LeaderboardEntry[];
    xpToNextTier: number | null;
}

const getTier = (rank: number): TierInfo => {
    if (rank === 1) return { name: 'EXECUTIVE', color: 'from-elite-accent-cyan/20 to-elite-accent-cyan/40', icon: <Gem className="h-5 w-5 text-elite-accent-cyan" />, textColor: 'text-elite-accent-cyan' };
    if (rank <= 10) return { name: 'ELITE', color: 'from-elite-accent-purple/20 to-elite-accent-purple/40', icon: <Trophy className="h-5 w-5 text-elite-accent-purple" />, textColor: 'text-elite-accent-purple' };
    if (rank <= 50) return { name: 'PROFICIENT', color: 'from-elite-accent-blue/20 to-elite-accent-blue/40', icon: <Medal className="h-5 w-5 text-elite-accent-blue" />, textColor: 'text-elite-accent-blue' };
    return { name: 'OPERATIVE', color: 'from-slate-500/20 to-slate-500/40', icon: <Award className="h-5 w-5 text-slate-400" />, textColor: 'text-slate-400' };
};

export function TieredLeaderboard({ entries: propEntries, currentUserRank: propRank }: TieredLeaderboardProps = {}) {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [userRankData, setUserRankData] = useState<UserRankData | null>(null);
    const [previousRanks, setPreviousRanks] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (propEntries && propRank !== undefined) {
            setLoading(false);
            return;
        }

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, [propEntries, propRank]);

    const fetchLeaderboard = async () => {
        try {
            const rankRes = await fetch('/api/leaderboard/rank');
            if (rankRes.status === 401) { setLoading(false); return; }
            if (!rankRes.ok) throw new Error('Failed to fetch rank');

            const rankResult = await rankRes.json();
            if (rankResult.success && rankResult.data) {
                setLeaderboardData(prev => {
                    if (prev?.leaderboard) {
                        const prevMap = new Map();
                        prev.leaderboard.forEach(e => prevMap.set(e.userId, e.rank));
                        setPreviousRanks(prevMap);
                    }
                    return prev;
                });

                setUserRankData(rankResult.data);
                const surroundingWithTiers = rankResult.data.surrounding.map((entry: LeaderboardEntry & { tier: TierInfo }) => ({
                    ...entry,
                    tier: entry.tier || getTier(entry.rank),
                }));

                setLeaderboardData({
                    leaderboard: surroundingWithTiers,
                    totalUsers: rankResult.data.total,
                });
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            if (loading) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getMovement = (userId: string, currentRank: number) => {
        if (!previousRanks.has(userId)) return 'same';
        const prev = previousRanks.get(userId)!;
        if (prev > currentRank) return 'up';
        if (prev < currentRank) return 'down';
        return 'same';
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-32 bg-white/5 rounded-[2.5rem]" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-2xl" />
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
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Ranking Synchrony Lost</div>
            </div>
        );
    }

    const currentUserTier = userRankData?.tier || getTier(100);
    const currentUserRank = userRankData?.rank || 0;
    const entries = leaderboardData?.leaderboard || [];

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Global Order</h2>
                    <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="relative flex h-1.5 w-1.5">
                            <motion.span
                                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inline-flex h-full w-full rounded-full bg-red-500"
                            />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                        </span>
                        <span className="text-[8px] font-black tracking-widest text-red-500 uppercase">Live Pulse</span>
                    </div>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentUserTier.textColor}`}>
                    {currentUserTier.icon}
                    <span>{currentUserTier.name} GRADE</span>
                </div>
            </div>

            {/* User Rank Summary */}
            <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentUserTier.color} border border-white/5 mb-8 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-20 transition-transform group-hover:scale-110 duration-500">
                    {currentUserTier.icon}
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Current Standing</div>
                        <div className="text-3xl font-black text-white tracking-tighter">RANK #{currentUserRank}</div>
                    </div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">
                        SUPERIOR TO {userRankData?.percentile?.toFixed(1) || '0.0'}% OF ALL OPERATIVES
                    </div>
                </div>
            </div>

            {/* Tier Legend */}
            <div className="grid grid-cols-4 gap-2 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                {[
                    { icon: <Gem className="h-5 w-5 text-elite-accent-cyan" />, label: 'EXEC', color: 'text-elite-accent-cyan' },
                    { icon: <Trophy className="h-5 w-5 text-elite-accent-purple" />, label: 'ELITE', color: 'text-elite-accent-purple' },
                    { icon: <Medal className="h-5 w-5 text-elite-accent-blue" />, label: 'PROF', color: 'text-elite-accent-blue' },
                    { icon: <Award className="h-5 w-5 text-slate-500" />, label: 'OPER', color: 'text-slate-500' }
                ].map((t) => (
                    <div key={t.label} className="text-center">
                        <div className="flex justify-center mb-1">{t.icon}</div>
                        <div className={`text-[8px] font-black uppercase tracking-widest ${t.color}`}>{t.label}</div>
                    </div>
                ))}
            </div>

            {/* Entries */}
            <div className="space-y-2">
                {entries.map((entry, index) => {
                    const movement = getMovement(entry.userId, entry.rank);
                    const tier = getTier(entry.rank);

                    return (
                        <motion.div
                            layout
                            key={entry.userId}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${entry.isCurrentUser
                                ? 'bg-elite-accent-cyan/10 border-elite-accent-cyan/30'
                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex flex-col items-center min-w-[32px]">
                                <span className={`text-xs font-black ${entry.isCurrentUser ? 'text-elite-accent-cyan' : 'text-white'}`}>#{entry.rank}</span>
                                {movement === 'up' && <span className="text-[8px] text-elite-accent-emerald font-black">▲</span>}
                                {movement === 'down' && <span className="text-[8px] text-red-500 font-black">▼</span>}
                            </div>

                            <div className="text-2xl grayscale group-hover:grayscale-0 transition-all">{entry.avatar || '👤'}</div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className={`text-xs font-black uppercase tracking-widest truncate ${entry.isCurrentUser ? 'text-elite-accent-cyan' : 'text-white'}`}>
                                        {entry.userName || 'Unknown'}
                                    </div>
                                    {entry.isCurrentUser && (
                                        <div className="px-1.5 py-0.5 rounded-[4px] bg-elite-accent-cyan text-[7px] font-black text-white uppercase tracking-tighter">
                                            SELF
                                        </div>
                                    )}
                                </div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {entry.xp?.toLocaleString() || 0} XP // LVL {entry.level}
                                </div>
                            </div>

                            <div className="text-lg opacity-40">{tier.icon}</div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 text-center bg-white/5 rounded-xl py-3 border border-white/5">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Next sync sequence in <span className="text-white">60S</span>
                </span>
            </div>
        </div>
    );
}
