// GET /api/user/stats/xp - Get user's current XP and level

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats, createUserStats } from '@/lib/models/UserStats';
import { getLevelInfo } from '@/lib/xp-system';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserStats>('userStats');

        // Find or create user stats
        let userStats = await collection.findOne({ userId });

        if (!userStats) {
            // Initialize new user stats
            userStats = createUserStats(userId);
            await collection.insertOne(userStats);
        }

        // Calculate level info
        const levelInfo = getLevelInfo(userStats.currentXP);

        return NextResponse.json({
            success: true,
            data: {
                currentXP: userStats.currentXP,
                currentLevel: userStats.currentLevel,
                levelInfo,
                streak: {
                    current: userStats.currentStreak,
                    longest: userStats.longestStreak,
                },
                stats: {
                    totalStudyMinutes: userStats.totalStudyMinutes,
                    totalQuizzes: userStats.totalQuizzes,
                    perfectScores: userStats.perfectScores,
                    completedCourses: userStats.completedCourses,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching user XP:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
