// GET /api/achievements/user - Get user's achievement progress

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserAchievements, getAchievementStats } from '@/lib/achievement-service';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const status = searchParams.get('status') as 'unlocked' | 'in_progress' | 'locked' | undefined;

        const achievements = await getUserAchievements(userId, { category, status });
        const stats = await getAchievementStats(userId);

        return NextResponse.json({
            success: true,
            data: {
                achievements,
                stats,
            },
        });
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
