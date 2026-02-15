// GET /api/user/stats/streak - Get user's streak data

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats, createUserStats } from '@/lib/models/UserStats';
import { createSuccessResponse } from '@/lib/error-handler';

export async function GET() {
    try {
        let userId: string | null = null;
        try {
            const authResult = await auth();
            userId = authResult?.userId || null;
        } catch {
            userId = null;
        }

        if (!userId) {
            // Graceful fallback for unauthenticated or transient auth failures.
            // Prevents noisy 401/500 cascades in client widgets.
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        currentStreak: 0,
                        longestStreak: 0,
                        lastStudyDate: '',
                    },
                    unauthenticated: true,
                },
                { status: 200 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserStats>('userStats');

        // Find or create user stats
        let userStats = await collection.findOne({ userId });

        if (!userStats) {
            const newUserStats = createUserStats(userId);
            await collection.insertOne(newUserStats);
            userStats = newUserStats;
        }

        return createSuccessResponse({
            currentStreak: userStats.currentStreak || 0,
            longestStreak: userStats.longestStreak || 0,
            lastStudyDate: userStats.lastStudyDate || '',
        });
    } catch {
        // Keep client stable even when DB/auth dependencies are temporarily unavailable.
        return NextResponse.json(
            {
                success: true,
                data: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: '',
                },
                degraded: true,
            },
            { status: 200 }
        );
    }
}
