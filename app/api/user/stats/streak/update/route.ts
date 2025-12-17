// POST /api/user/stats/streak/update - Update streak on study activity

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats, createUserStats } from '@/lib/models/UserStats';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const db = await getDatabase();
        const collection = db.collection<UserStats>('userStats');

        // Find or create user stats
        let userStats = await collection.findOne({ userId });

        if (!userStats) {
            const newUserStats = createUserStats(userId);
            newUserStats.lastStudyDate = today;
            newUserStats.currentStreak = 1;
            newUserStats.longestStreak = 1;
            await collection.insertOne(newUserStats);

            return NextResponse.json({
                success: true,
                data: {
                    currentStreak: 1,
                    longestStreak: 1,
                    isNewStreak: true,
                    xpAwarded: 0, // First day doesn't award streak XP
                },
            });
        }

        const lastDate = userStats.lastStudyDate;

        // If already studied today, no update needed
        if (lastDate === today) {
            return NextResponse.json({
                success: true,
                data: {
                    currentStreak: userStats.currentStreak,
                    longestStreak: userStats.longestStreak,
                    isNewStreak: false,
                    xpAwarded: 0,
                },
            });
        }

        // Calculate new streak
        let newStreak: number;
        let isNewStreak = false;

        if (lastDate === yesterday) {
            // Consecutive day - increment streak
            newStreak = userStats.currentStreak + 1;
            isNewStreak = true;
        } else {
            // Streak broken - reset to 1
            newStreak = 1;
        }

        const newLongestStreak = Math.max(newStreak, userStats.longestStreak);

        // Update database
        await collection.updateOne(
            { userId },
            {
                $set: {
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastStudyDate: today,
                    updatedAt: new Date(),
                },
            }
        );

        // Award streak XP if consecutive
        let xpAwarded = 0;
        if (isNewStreak && newStreak > 1) {
            try {
                const xpResponse = await fetch(`${request.nextUrl.origin}/api/user/stats/xp/award`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        cookie: request.headers.get('cookie') || '',
                    },
                    body: JSON.stringify({
                        action: 'daily_streak',
                        metadata: { streak: newStreak },
                    }),
                });

                if (xpResponse.ok) {
                    const xpData = await xpResponse.json();
                    xpAwarded = xpData.data?.xpAwarded || 0;
                }
            } catch (error) {
                console.error('Failed to award streak XP:', error);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                isNewStreak,
                xpAwarded,
                milestone: newStreak % 7 === 0 ? newStreak : null, // Celebrate every 7 days
            },
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
