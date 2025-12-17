// GET /api/analytics/activity-heatmap - Heatmap data with caching
// OPTIMIZED: Cache heavy aggregation for 1 hour

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { subMonths } from 'date-fns';
import { CacheService } from '@/lib/cache-service';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const months = parseInt(searchParams.get('months') || '3');

        // CACHE KEY: Heatmap specific to user and duration
        const CACHE_KEY = `analytics:heatmap:${userId}:${months}`;
        const CACHE_TTL = 3600; // 1 hour (analytics don't need real-time precision)

        const data = await CacheService.wrap(CACHE_KEY, CACHE_TTL, async () => {
            const db = await getDatabase();
            const startDate = subMonths(new Date(), months);

            // 1. Fetch activities
            const activities = await db.collection('studyActivities').aggregate([
                { $match: { userId, createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        minutes: { $sum: "$durationSeconds" },
                        scoreSum: { $sum: "$score" }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray();

            // 2. Transform + Calculate Stats
            const heatmapData = activities.map(day => {
                const mins = Math.round(day.minutes / 60);
                let intensity = 0;
                if (mins > 0) intensity = 1;
                if (mins > 30) intensity = 2;
                if (mins > 60) intensity = 3;
                if (mins > 120) intensity = 4;

                return {
                    date: day._id,
                    count: day.count,
                    minutes: mins,
                    intensity
                };
            });

            // 3. Overall Stats
            const totalActivities = activities.reduce((sum, d) => sum + d.count, 0);
            const activeDays = activities.length;
            // ... calculate streaks logic here if needed (omitted for brevity in this cache block)

            return {
                heatmapData,
                stats: {
                    activeDays,
                    totalActivities,
                    // Note: full streak calc relies on UserStats usually, keeping it simple here
                    currentStreak: 0,
                    longestStreak: 0
                }
            };
        });

        // Enrich with live streak data from UserStats (fast, single read)
        // We mix cached heavy data with fresh light data
        const db = await getDatabase();
        const userStats = await db.collection('userStats').findOne({ userId });
        if (userStats && data.stats) {
            data.stats.currentStreak = userStats.currentStreak;
            data.stats.longestStreak = userStats.longestStreak;
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error heat map:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
