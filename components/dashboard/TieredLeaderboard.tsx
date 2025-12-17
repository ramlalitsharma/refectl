'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';

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
    icon: string;
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
    if (rank === 1) return { name: 'Platinum', color: 'from-blue-400 to-cyan-400', icon: '💎', textColor: 'text-cyan-700' };
    if (rank <= 10) return { name: 'Gold', color: 'from-yellow-400 to-orange-400', icon: '🥇', textColor: 'text-yellow-700' };
    if (rank <= 50) return { name: 'Silver', color: 'from-slate-300 to-slate-400', icon: '🥈', textColor: 'text-slate-600' };
    return { name: 'Bronze', color: 'from-amber-600 to-amber-700', icon: '🥉', textColor: 'text-amber-700' };
};

const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
};

export function TieredLeaderboard({ entries: propEntries, currentUserRank: propRank }: TieredLeaderboardProps = {}) {
    // State for Live Data
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [userRankData, setUserRankData] = useState<UserRankData | null>(null);
    const [previousRanks, setPreviousRanks] = useState<Map<string, number>>(new Map()); // Map<UserId, Rank>
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Polling Interval (60s)
    useEffect(() => {
        if (propEntries && propRank !== undefined) {
            setLoading(false);
            return;
        }

        fetchLeaderboard(); // Initial fetch

        const interval = setInterval(() => {
            fetchLeaderboard();
        }, 60000);

        return () => clearInterval(interval);
    }, [propEntries, propRank]);

    const fetchLeaderboard = async () => {
        try {
            const rankRes = await fetch('/api/leaderboard/rank');
            if (rankRes.status === 401) { setLoading(false); return; }
            if (!rankRes.ok) throw new Error('Failed to fetch rank');

            const rankResult = await rankRes.json();
            if (rankResult.success && rankResult.data) {

                // Store previous ranks before updating
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

                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            // Don't set error state on poll fail usually, just log
            if (loading) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getMovement = (userId: string, currentRank: number) => {
        if (!previousRanks.has(userId)) return 'same';
        const prev = previousRanks.get(userId)!;
        if (prev > currentRank) return 'up';   // Rank went down (e.g. 5 -> 4), so moved UP
        if (prev < currentRank) return 'down'; // Rank went up (e.g. 4 -> 5), so moved DOWN
        return 'same';
    };

    const currentUserTier = userRankData?.tier || getTier(1);
    const currentUserRank = userRankData?.rank || 0;
    const entries = leaderboardData?.leaderboard || [];

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        🏆 Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                        ))}
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Failed to load: {error}</div>;
    }

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                    <span className="flex items-center gap-3">
                        🏆 Leaderboard
                        {/* Live Indicator */}
                        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-full border border-red-100">
                            <span className="relative flex h-2 w-2">
                                <motion.span
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                                />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                            </span>
                            <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
                                Live
                            </span>
                        </div>
                    </span>
                    <span className={`text-sm font-normal normal-case ${currentUserTier.textColor}`} >
                        {currentUserTier.icon} {currentUserTier.name}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Tier Badge */}
                <div className={`p-4 rounded-xl bg-gradient-to-r ${currentUserTier.color} text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium opacity-90">Your Tier</div>
                            <div className="text-2xl font-black">{currentUserTier.name}</div>
                        </div>
                        <div className="text-5xl">{currentUserTier.icon}</div>
                    </div>
                    <div className="mt-2 text-sm opacity-90">
                        Rank #{currentUserRank} • Top {userRankData?.percentile?.toFixed(1) || '0.0'}%
                    </div>
                </div>

                {/* Tier Legend */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div><div className="text-xl">💎</div><span className="font-semibold text-cyan-700">Plat</span></div>
                    <div><div className="text-xl">🥇</div><span className="font-semibold text-yellow-700">Gold</span></div>
                    <div><div className="text-xl">🥈</div><span className="font-semibold text-slate-600">Silver</span></div>
                    <div><div className="text-xl">🥉</div><span className="font-semibold text-amber-700">Bronze</span></div>
                </div>

                {/* Leaderboard Entries */}
                <div className="space-y-2">
                    {entries.map((entry, index) => {
                        const tier = getTier(entry.rank);
                        const movement = getMovement(entry.userId, entry.rank);

                        return (
                            <motion.div
                                layout
                                key={entry.userId} // Use UserID as key for stable animations
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${entry.isCurrentUser
                                    ? 'bg-teal-50 border-teal-300 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-teal-200'
                                    }`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {/* Rank & Movement */}
                                <div className="flex flex-col items-center min-w-[30px]">
                                    <span className="font-bold text-slate-700">#{entry.rank}</span>
                                    {movement === 'up' && <span className="text-[10px] text-green-500 font-bold">▲</span>}
                                    {movement === 'down' && <span className="text-[10px] text-red-500 font-bold">▼</span>}
                                </div>

                                {/* Avatar */}
                                <div className="text-2xl">{entry.avatar || '👤'}</div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className={`font-semibold truncate ${entry.isCurrentUser ? 'text-teal-700' : 'text-slate-800'}`}>
                                        {entry.userName || 'User'}
                                        {entry.isCurrentUser && <span className="ml-2 text-xs bg-teal-200 text-teal-700 px-2 py-0.5 rounded-full">You</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {entry.xp?.toLocaleString() || 0} XP
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    Updates live every 60s
                </p>
            </CardContent>
        </Card>
    );
}
