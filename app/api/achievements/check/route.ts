// POST /api/achievements/check - Check and unlock achievements

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkAchievements } from '@/lib/achievement-service';
import { sendNotification } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { achievementIds } = body;

        const result = await checkAchievements(userId, achievementIds);

        // Send notifications for new unlocks
        for (const unlock of result.newUnlocks) {
            await sendNotification({
                userId,
                type: 'achievement',
                title: '🌟 Achievement Unlocked!',
                message: `${unlock.achievementName} - ${unlock.tierName}`,
                icon: '🌟',
                priority: 'high',
                metadata: {
                    achievementId: unlock.achievementId,
                    tier: unlock.tier,
                    xpAwarded: unlock.xpAwarded,
                },
            });

            // Award XP
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/stats/xp/award`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    action: 'achievement_tier',
                    amount: unlock.xpAwarded,
                }),
            });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error checking achievements:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
