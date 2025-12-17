// GET /api/leaderboard/rank - Get current user rank and surrounding players
// OPTIMIZED: Uses Cached Leaderboard Snapshot

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { getTier } from '@/lib/leaderboard-system';
import { CacheService } from '@/lib/cache-service';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // CACHE KEY: Global Leaderboard
        // We cache the entire sorted list of stats for 5 minutes
        // This is much faster than running the aggregation pipeline on every user request
        const CACHE_KEY = `leaderboard:global_stats`;
        const CACHE_TTL = 300; // 5 minutes

        const sortedStats = await CacheService.wrap(CACHE_KEY, CACHE_TTL, async () => {
            const db = await getDatabase();
            return await db.collection('userStats')
                .find({})
                .sort({ currentXP: -1, totalQuizzes: -1 })
                .limit(1000) // Top 1000 is enough for most contexts
                .toArray();
        });

        // Calculate Rank in memory (fast)
        const rank = sortedStats.findIndex((s: any) => s.userId === userId) + 1;
        const totalUsers = sortedStats.length;

        // If user not in top 1000, fallback to DB count (slower but rare)
        let actualRank = rank;
        if (rank === 0) {
            const db = await getDatabase();
            // Simple count of people with more XP
            const myStats = await db.collection('userStats').findOne({ userId });
            if (myStats) {
                actualRank = await db.collection('userStats').countDocuments({
                    currentXP: { $gt: myStats.currentXP }
                }) + 1;
            }
        }

        const tier = getTier(actualRank);

        // Get Surrounding (Top 3 + Neighbors)
        // Since we have the sorted array cached, this is effectively instant
        const top3 = sortedStats.slice(0, 3);
        let surrounding: any[] = [];

        if (rank > 0) {
            const start = Math.max(0, rank - 2); // 1 before
            const end = Math.min(sortedStats.length, rank + 1); // 1 after
            surrounding = sortedStats.slice(start, end);
        }

        // Merge and Dedupe
        const map = new Map();
        [...top3, ...surrounding].forEach((s: any) => map.set(s.userId, s));
        const displayList = Array.from(map.values());

        // Hydrate names (could also be cached or stored in UserStats)
        // For now, we fetch names for these few users
        const db = await getDatabase();
        const userIds = displayList.map((s: any) => s.userId);
        const users = await db.collection('users').find({ userId: { $in: userIds } }).toArray();
        const userMap = new Map(users.map(u => [u.userId, u]));

        const data = {
            rank: actualRank,
            tier,
            total: totalUsers,
            surrounding: displayList.map((s: any, idx) => {
                const u = userMap.get(s.userId);
                // Calculate rank based on position in sorted list for accuracy
                const entryRank = sortedStats.findIndex((x: any) => x.userId === s.userId) + 1;
                return {
                    rank: entryRank,
                    userId: s.userId,
                    userName: u?.name || 'Unknown',
                    avatar: u?.avatar || '👤',
                    level: s.currentLevel,
                    xp: s.currentXP,
                    isCurrentUser: s.userId === userId
                };
            }).sort((a, b) => a.rank - b.rank)
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching rank:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
