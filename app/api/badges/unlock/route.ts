// POST /api/badges/unlock - Manually unlock a badge (for special/manual badges)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserBadge, createUserBadge } from '@/lib/models/UserBadge';
import { getBadgeById } from '@/lib/badge-system';
import { z } from 'zod';

const unlockSchema = z.object({
    badgeId: z.string(),
});

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
        const validation = unlockSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: validation.error },
                { status: 400 }
            );
        }

        const { badgeId } = validation.data;

        // Verify badge exists
        const badge = getBadgeById(badgeId);
        if (!badge) {
            return NextResponse.json(
                { error: 'Badge not found' },
                { status: 404 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserBadge>('userBadges');

        // Check if badge already earned
        const existing = await collection.findOne({ userId, badgeId });

        if (existing?.earned) {
            return NextResponse.json({
                success: true,
                data: {
                    badge,
                    alreadyEarned: true,
                    earnedDate: existing.earnedDate,
                },
            });
        }

        // Unlock badge
        if (existing) {
            await collection.updateOne(
                { userId, badgeId },
                {
                    $set: {
                        earned: true,
                        earnedDate: new Date(),
                        progress: 100,
                        updatedAt: new Date(),
                    },
                }
            );
        } else {
            const newBadge = createUserBadge(userId, badgeId, 100);
            newBadge.earned = true;
            newBadge.earnedDate = new Date();
            await collection.insertOne(newBadge);
        }

        // Award XP
        try {
            await fetch(`${request.nextUrl.origin}/api/user/stats/xp/award`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: request.headers.get('cookie') || '',
                },
                body: JSON.stringify({
                    action: 'earn_badge',
                }),
            });
        } catch (error) {
            console.error('Failed to award badge XP:', error);
        }

        return NextResponse.json({
            success: true,
            data: {
                badge,
                earnedDate: new Date(),
                xpAwarded: 75,
            },
        });
    } catch (error) {
        console.error('Error unlocking badge:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
