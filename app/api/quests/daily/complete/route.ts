import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { DailyQuests } from '@/lib/models/DailyQuests';
// import { calculateQuestBonus } from '@/lib/quest-system'; // Removed missing import

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fix Date handling to match lib/quest-system.ts
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const db = await getDatabase();
        const collection = db.collection<DailyQuests>('dailyQuests');

        // Find today's quests
        const dailyQuests = await collection.findOne({ userId, date: today });

        if (!dailyQuests) {
            return NextResponse.json({ error: 'No quests found for today' }, { status: 404 });
        }

        // Safety check for quests array
        if (!Array.isArray(dailyQuests.quests)) {
            return NextResponse.json({ error: 'Quests data corrupted' }, { status: 500 });
        }

        // Check if all quests are completed
        const allCompleted = dailyQuests.quests.every(q => q.completed);

        if (!allCompleted) {
            return NextResponse.json({ error: 'Not all quests are completed' }, { status: 400 });
        }

        // Check if bonus already awarded
        if (dailyQuests.bonusAwarded) {
            return NextResponse.json({
                success: true,
                data: { bonusAwarded: true, alreadyAwarded: true, bonusXP: 0 }
            });
        }

        // Calculate bonus XP locally since import was missing
        const bonusXP = dailyQuests.quests.reduce((acc, q) => acc + (q.xpReward || 0), 0) * 0.5; // 50% bonus example

        try {
            await fetch(`${request.nextUrl.origin}/api/user/stats/xp/award`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: request.headers.get('cookie') || '',
                },
                body: JSON.stringify({
                    action: 'complete_quest_bonus',
                    amount: bonusXP,
                    metadata: { bonus: true },
                }),
            });
        } catch (error) {
            console.error('Failed to award bonus XP:', error);
        }

        // Mark bonus as awarded
        await collection.updateOne(
            { userId, date: today },
            { $set: { bonusAwarded: true, updatedAt: new Date() } }
        );

        return NextResponse.json({
            success: true,
            data: {
                bonusAwarded: true,
                bonusXP,
                celebration: true,
            },
        });
    } catch (error) {
        console.error('Error completing daily quests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
