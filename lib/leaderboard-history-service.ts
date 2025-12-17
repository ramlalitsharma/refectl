// Leaderboard History Service - Track rank changes over time

import { getDatabase } from './mongodb';
import {
    LeaderboardSnapshot,
    UserRankHistory,
    UserRankStats,
    SnapshotType,
    TierType,
    LEADERBOARD_HISTORY_COLLECTION,
    USER_RANK_HISTORY_COLLECTION,
} from './models/LeaderboardHistory';
import { calculateRankings } from './leaderboard-system';

/**
 * Create a leaderboard snapshot
 */
export async function createLeaderboardSnapshot(type: SnapshotType): Promise<LeaderboardSnapshot> {
    const db = await getDatabase();
    const snapshotCol = db.collection<LeaderboardSnapshot>(LEADERBOARD_HISTORY_COLLECTION);

    // Get all user stats for rankings
    const userStats = await db.collection('userStats').find({}).toArray();

    // Calculate current rankings
    const rankings = calculateRankings(userStats);

    // Create snapshot
    const snapshot: LeaderboardSnapshot = {
        snapshotType: type,
        snapshotDate: new Date(),
        rankings: rankings.slice(0, 100).map(r => ({
            userId: r.userId,
            userName: r.userName,
            rank: r.rank,
            xp: r.xp,
            level: r.level,
            tier: r.tier as TierType,
        })),
        totalUsers: rankings.length,
        createdAt: new Date(),
    };

    await snapshotCol.insertOne(snapshot);

    // Also record individual user histories
    for (const ranking of rankings.slice(0, 100)) {
        await recordUserRank(
            ranking.userId,
            ranking.rank,
            ranking.xp,
            ranking.level,
            ranking.tier as TierType
        );
    }

    return snapshot;
}

/**
 * Get leaderboard snapshots
 */
export async function getLeaderboardHistory(
    type?: SnapshotType,
    limit: number = 10
): Promise<LeaderboardSnapshot[]> {
    const db = await getDatabase();
    const snapshotCol = db.collection<LeaderboardSnapshot>(LEADERBOARD_HISTORY_COLLECTION);

    const query: any = {};
    if (type) {
        query.snapshotType = type;
    }

    const snapshots = await snapshotCol
        .find(query)
        .sort({ snapshotDate: -1 })
        .limit(limit)
        .toArray();

    return snapshots;
}

/**
 * Record user's current rank
 */
export async function recordUserRank(
    userId: string,
    rank: number,
    xp: number,
    level: number,
    tier: TierType,
    previousRank?: number
): Promise<UserRankHistory> {
    const db = await getDatabase();
    const historyCol = db.collection<UserRankHistory>(USER_RANK_HISTORY_COLLECTION);

    // Calculate rank change
    let rankChange = 0;
    let tierChange: 'promoted' | 'demoted' | null = null;

    if (previousRank !== undefined) {
        rankChange = previousRank - rank; // Positive = improved
    } else {
        // Try to get previous rank from history
        const lastRecord = await historyCol.findOne(
            { userId },
            { sort: { date: -1 } }
        );

        if (lastRecord) {
            rankChange = lastRecord.rank - rank;

            // Check tier change
            const tiers: TierType[] = ['platinum', 'gold', 'silver', 'bronze'];
            const prevTierIndex = tiers.indexOf(lastRecord.tier);
            const currTierIndex = tiers.indexOf(tier);

            if (currTierIndex < prevTierIndex) {
                tierChange = 'promoted';
            } else if (currTierIndex > prevTierIndex) {
                tierChange = 'demoted';
            }
        }
    }

    const record: UserRankHistory = {
        userId,
        date: new Date(),
        rank,
        xp,
        level,
        tier,
        rankChange,
        tierChange,
        createdAt: new Date(),
    };

    await historyCol.insertOne(record);

    return record;
}

/**
 * Get user's rank history
 */
export async function getUserRankHistory(
    userId: string,
    days: number = 30
): Promise<{ history: UserRankHistory[]; stats: UserRankStats }> {
    const db = await getDatabase();
    const historyCol = db.collection<UserRankHistory>(USER_RANK_HISTORY_COLLECTION);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await historyCol
        .find({
            userId,
            date: { $gte: startDate },
        })
        .sort({ date: -1 })
        .toArray();

    // Calculate stats
    let stats: UserRankStats = {
        currentRank: 0,
        bestRank: Infinity,
        worstRank: 0,
        averageRank: 0,
        rankChange7Days: 0,
        rankChange30Days: 0,
        tierChanges: 0,
        currentTier: 'bronze',
    };

    if (history.length > 0) {
        stats.currentRank = history[0].rank;
        stats.currentTier = history[0].tier;

        // Calculate best/worst/average
        let totalRank = 0;
        for (const record of history) {
            if (record.rank < stats.bestRank) stats.bestRank = record.rank;
            if (record.rank > stats.worstRank) stats.worstRank = record.rank;
            totalRank += record.rank;
            if (record.tierChange) stats.tierChanges++;
        }
        stats.averageRank = Math.round(totalRank / history.length);

        // Calculate rank changes
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const record7DaysAgo = history.find(r => r.date <= sevenDaysAgo);
        if (record7DaysAgo) {
            stats.rankChange7Days = record7DaysAgo.rank - stats.currentRank;
        }

        const oldestRecord = history[history.length - 1];
        stats.rankChange30Days = oldestRecord.rank - stats.currentRank;
    }

    return { history, stats };
}

/**
 * Calculate rank change for a user
 */
export async function calculateRankChange(
    userId: string,
    currentRank: number
): Promise<number> {
    const db = await getDatabase();
    const historyCol = db.collection<UserRankHistory>(USER_RANK_HISTORY_COLLECTION);

    const lastRecord = await historyCol.findOne(
        { userId },
        { sort: { date: -1 } }
    );

    if (!lastRecord) return 0;

    return lastRecord.rank - currentRank;
}

/**
 * Cleanup old snapshots
 */
export async function cleanupOldSnapshots(): Promise<number> {
    const db = await getDatabase();
    const snapshotCol = db.collection<LeaderboardSnapshot>(LEADERBOARD_HISTORY_COLLECTION);

    const now = new Date();

    // Delete daily snapshots older than 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyResult = await snapshotCol.deleteMany({
        snapshotType: 'daily',
        snapshotDate: { $lt: thirtyDaysAgo },
    });

    // Delete weekly snapshots older than 12 weeks
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const weeklyResult = await snapshotCol.deleteMany({
        snapshotType: 'weekly',
        snapshotDate: { $lt: twelveWeeksAgo },
    });

    // Delete monthly snapshots older than 12 months
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyResult = await snapshotCol.deleteMany({
        snapshotType: 'monthly',
        snapshotDate: { $lt: twelveMonthsAgo },
    });

    return dailyResult.deletedCount + weeklyResult.deletedCount + monthlyResult.deletedCount;
}
