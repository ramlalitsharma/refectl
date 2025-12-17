// GET /api/user/stats/streak - Get user's streak data

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats, createUserStats } from '@/lib/models/UserStats';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return createErrorResponse(
                new Error('Unauthorized'),
                'Unauthorized',
                401
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
    } catch (error) {
        return createErrorResponse(error, 'Failed to fetch streak data', 500);
    }
}
