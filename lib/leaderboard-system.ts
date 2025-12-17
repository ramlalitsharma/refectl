// Leaderboard System Utilities
// Handles ranking calculations, tier assignments, and leaderboard generation

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    avatar: string;
    level: number;
    xp: number;
    rank: number;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface TierInfo {
    name: string;
    color: string;
    icon: string;
    textColor: string;
    minRank: number;
    maxRank: number | null;
}

// Get tier information based on rank
export function getTier(rank: number): TierInfo {
    if (rank === 1) {
        return {
            name: 'Platinum',
            color: 'from-blue-400 to-cyan-400',
            icon: '💎',
            textColor: 'text-cyan-700',
            minRank: 1,
            maxRank: 1,
        };
    }
    if (rank <= 10) {
        return {
            name: 'Gold',
            color: 'from-yellow-400 to-orange-400',
            icon: '🥇',
            textColor: 'text-yellow-700',
            minRank: 2,
            maxRank: 10,
        };
    }
    if (rank <= 50) {
        return {
            name: 'Silver',
            color: 'from-slate-300 to-slate-400',
            icon: '🥈',
            textColor: 'text-slate-600',
            minRank: 11,
            maxRank: 50,
        };
    }
    return {
        name: 'Bronze',
        color: 'from-amber-600 to-amber-700',
        icon: '🥉',
        textColor: 'text-amber-700',
        minRank: 51,
        maxRank: null,
    };
}

// Get rank medal emoji
export function getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

// Calculate rankings from user stats
export function calculateRankings(
    userStats: Array<{
        userId: string;
        userName: string;
        avatar?: string;
        xp: number;
        level: number;
    }>
): LeaderboardEntry[] {
    // Sort by XP descending, then by level
    const sorted = [...userStats].sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.level - a.level;
    });

    // Assign ranks and tiers
    return sorted.map((user, index) => {
        const rank = index + 1;
        const tier = getTier(rank).name.toLowerCase() as LeaderboardEntry['tier'];

        return {
            userId: user.userId,
            userName: user.userName,
            avatar: user.avatar || '👤',
            level: user.level,
            xp: user.xp,
            rank,
            tier,
        };
    });
}

// Get user's rank from leaderboard
export function getUserRank(
    leaderboard: LeaderboardEntry[],
    userId: string
): number | null {
    const entry = leaderboard.find(e => e.userId === userId);
    return entry ? entry.rank : null;
}

// Get surrounding users on leaderboard (for context)
export function getSurroundingUsers(
    leaderboard: LeaderboardEntry[],
    userId: string,
    count: number = 2
): LeaderboardEntry[] {
    const userIndex = leaderboard.findIndex(e => e.userId === userId);
    if (userIndex === -1) return [];

    const start = Math.max(0, userIndex - count);
    const end = Math.min(leaderboard.length, userIndex + count + 1);

    return leaderboard.slice(start, end);
}

// Get top N users
export function getTopUsers(
    leaderboard: LeaderboardEntry[],
    n: number = 10
): LeaderboardEntry[] {
    return leaderboard.slice(0, n);
}

// Get users by tier
export function getUsersByTier(
    leaderboard: LeaderboardEntry[],
    tier: LeaderboardEntry['tier']
): LeaderboardEntry[] {
    return leaderboard.filter(e => e.tier === tier);
}

// Calculate percentile rank
export function getPercentileRank(
    leaderboard: LeaderboardEntry[],
    userId: string
): number {
    const rank = getUserRank(leaderboard, userId);
    if (!rank) return 0;

    const totalUsers = leaderboard.length;
    return Math.round(((totalUsers - rank) / totalUsers) * 100);
}

// Get rank change from previous snapshot
export function getRankChange(
    currentRank: number,
    previousRank: number | null
): {
    change: number;
    direction: 'up' | 'down' | 'same' | 'new';
    display: string;
} {
    if (previousRank === null) {
        return {
            change: 0,
            direction: 'new',
            display: 'New',
        };
    }

    const change = previousRank - currentRank;

    if (change > 0) {
        return {
            change,
            direction: 'up',
            display: `↑ ${change}`,
        };
    }

    if (change < 0) {
        return {
            change: Math.abs(change),
            direction: 'down',
            display: `↓ ${Math.abs(change)}`,
        };
    }

    return {
        change: 0,
        direction: 'same',
        display: '—',
    };
}

// Get XP needed to reach next tier
export function getXPToNextTier(
    currentRank: number,
    currentXP: number,
    leaderboard: LeaderboardEntry[]
): number | null {
    const currentTier = getTier(currentRank);

    // If already platinum, no next tier
    if (currentTier.name === 'Platinum') return null;

    // Find the XP of the user just above the tier boundary
    const nextTierMinRank = currentTier.minRank - 1;
    if (nextTierMinRank < 1) return null;

    const userAtBoundary = leaderboard.find(e => e.rank === nextTierMinRank);
    if (!userAtBoundary) return null;

    return Math.max(0, userAtBoundary.xp - currentXP + 1);
}
