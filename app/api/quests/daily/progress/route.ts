// POST /api/quests/daily/progress - Update quest progress

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { DailyQuests } from '@/lib/models/DailyQuests';
import { updateQuestProgress, calculateQuestBonus } from '@/lib/quest-system';
import { z } from 'zod';

const progressSchema = z.object({
    questId: z.string(),
    increment: z.number().positive(),
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
        const validation = progressSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request body', details: validation.error },
                { status: 400 }
            );
        }

        const { questId, increment } = validation.data;
        const today = new Date().toISOString().split('T')[0];

        const db = await getDatabase();
        const collection = db.collection<DailyQuests>('dailyQuests');

        // Find today's quests
        const dailyQuests = await collection.findOne({ userId, date: today });

        if (!dailyQuests) {
            return NextResponse.json(
                { error: 'No quests found for today' },
                { status: 404 }
            );
        }

        // Find and update the specific quest
        const questIndex = dailyQuests.quests.findIndex(q => q.id === questId);

        if (questIndex === -1) {
            return NextResponse.json(
                { error: 'Quest not found' },
                { status: 404 }
            );
        }

        const quest = dailyQuests.quests[questIndex];

        // Don't update if already completed
        if (quest.completed) {
            return NextResponse.json({
                success: true,
                data: {
                    quest,
                    alreadyCompleted: true,
                },
            });
        }

        // Update progress
        const updatedQuest = updateQuestProgress(quest, increment);
        dailyQuests.quests[questIndex] = updatedQuest;

        // Check if quest just completed
        const justCompleted = !quest.completed && updatedQuest.completed;

        if (justCompleted) {
            dailyQuests.completedCount = dailyQuests.quests.filter(q => q.completed).length;

            // Award XP for quest completion
            try {
                await fetch(`${request.nextUrl.origin}/api/user/stats/xp/award`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        cookie: request.headers.get('cookie') || '',
                    },
                    body: JSON.stringify({
                        action: 'complete_quest',
                    }),
                });
            } catch (error) {
                console.error('Failed to award quest XP:', error);
            }
        }

        // Update in database
        await collection.updateOne(
            { userId, date: today },
            {
                $set: {
                    quests: dailyQuests.quests,
                    completedCount: dailyQuests.completedCount,
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                quest: updatedQuest,
                justCompleted,
                completedCount: dailyQuests.completedCount,
                totalQuests: dailyQuests.quests.length,
            },
        });
    } catch (error) {
        console.error('Error updating quest progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
