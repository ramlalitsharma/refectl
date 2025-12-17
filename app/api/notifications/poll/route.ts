// GET /api/notifications/poll - Smart Polling Endpoint
// Efficiently checks for updates since a specific timestamp

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sinceParam = searchParams.get('since');
        const since = sinceParam ? new Date(parseInt(sinceParam)) : new Date(Date.now() - 30000); // Default to last 30s

        const db = await getDatabase();

        // 1. Check for New Notifications
        const newNotifications = await db.collection('notifications')
            .find({
                userId,
                createdAt: { $gt: since },
                read: false
            })
            .sort({ createdAt: -1 })
            .toArray();

        // 2. Check for Updated UserStats (XP/Level changes)
        // We only attach this if it changed recently
        const recentStatsUpdate = await db.collection('userStats').findOne({
            userId,
            lastActivityDate: { $gt: since }
        });

        // 3. New Activity Feed (Friend actions)
        // Optional: Only if needed for a "Toast" about friend activity
        // const newActivity = ...

        const hasUpdates = newNotifications.length > 0 || !!recentStatsUpdate;

        return NextResponse.json({
            success: true,
            hasUpdates,
            timestamp: Date.now(),
            data: {
                notifications: newNotifications,
                stats: recentStatsUpdate ? {
                    currentXP: recentStatsUpdate.currentXP,
                    currentLevel: recentStatsUpdate.currentLevel,
                    streak: recentStatsUpdate.currentStreak
                } : null
            }
        });

    } catch (error) {
        console.error('Polling Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
