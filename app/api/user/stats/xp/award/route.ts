// POST /api/user/stats/xp/award - Award XP for actions

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { UserStats, createUserStats } from '@/lib/models/UserStats';
import { calculateXPReward, checkLevelUp, getLevelFromXP } from '@/lib/xp-system';
import { z } from 'zod';

const awardSchema = z.object({
    action: z.string(),
    metadata: z.record(z.any()).optional(),
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
        const validation = awardSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: validation.error },
                { status: 400 }
            );
        }

        const { action, metadata } = validation.data;

        // Calculate XP reward
        const xpAmount = calculateXPReward(action, metadata);

        if (xpAmount === 0) {
            return NextResponse.json(
                { error: 'Unknown action or no XP awarded' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const collection = db.collection<UserStats>('userStats');

        // Find or create user stats
        let userStats = await collection.findOne({ userId });

        if (!userStats) {
            userStats = createUserStats(userId);
            await collection.insertOne(userStats);
        }

        // Calculate new values
        const oldXP = userStats.currentXP;
        const newXP = oldXP + xpAmount;
        const levelUpInfo = checkLevelUp(oldXP, newXP);
        const newLevel = getLevelFromXP(newXP);

        // Update stats
        const updateResult = await collection.updateOne(
            { userId },
            {
                $set: {
                    currentXP: newXP,
                    currentLevel: newLevel,
                    updatedAt: new Date(),
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json(
                { error: 'Failed to update user stats' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                xpAwarded: xpAmount,
                currentXP: newXP,
                currentLevel: newLevel,
                leveledUp: levelUpInfo.leveledUp,
                oldLevel: levelUpInfo.oldLevel,
                newLevel: levelUpInfo.newLevel,
            },
        });
    } catch (error) {
        console.error('Error awarding XP:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
