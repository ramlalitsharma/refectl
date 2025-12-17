import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateDailyQuests } from '@/lib/quest-system';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();

        // Check if we need to reset/generate quests
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingDaily = await db.collection('dailyQuests').findOne({
            userId,
            date: today
        });

        let quests = [];

        if (!existingDaily) {
            // Generate new quests
            quests = await generateDailyQuests(userId);
        } else {
            quests = existingDaily.quests;
        }

        // Get simplified stats
        const stats = {
            totalCompleted: quests.filter((q: any) => q.completed).length,
            totalXPEarned: quests.reduce((acc: number, q: any) => acc + (q.completed ? (q.xpReward || 0) : 0), 0)
        };

        return NextResponse.json({
            success: true,
            data: {
                quests,
                stats,
                bonusAwarded: false // simplified logic for now
            },
            meta: {
                nextReset: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

    } catch (error) {
        console.error('Daily quest fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
