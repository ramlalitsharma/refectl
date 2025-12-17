// Quest System - Database-Driven Version

import { getDatabase } from './mongodb';
import { QuestTemplate, QUEST_TEMPLATES_COLLECTION } from './models/QuestTemplate';

// Generate Daily Quests from DB Templates
export async function generateDailyQuests(userId: string): Promise<any[]> {
    const db = await getDatabase();

    // 1. Fetch active templates
    const templates = await db.collection<QuestTemplate>(QUEST_TEMPLATES_COLLECTION)
        .find({ active: true, frequency: 'daily' })
        .toArray();

    if (templates.length < 3) {
        console.warn('Not enough quest templates in DB!');
        // Allow it to return fewer, or fallback logic could go here
    }

    // 2. Randomly select 3 unique templates
    const shuffled = templates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Create user quest instances
    const quests = selected.map(template => ({
        questId: template.id,
        title: template.title,
        description: template.description,
        type: template.type,
        progress: 0,
        requirement: template.requirementValue,
        xpReward: template.xpReward,
        completed: false,
        rarity: template.rarity || 'common'
    }));

    // 4. Save to dailyQuests collection
    await db.collection('dailyQuests').updateOne(
        { userId, date: today },
        {
            $setOnInsert: {
                userId,
                date: today,
                quests,
                lastUpdated: new Date()
            }
        },
        { upsert: true }
    );

    return quests;
}

// Check Quest Progress (Generic Logic)
export async function checkQuestProgress(userId: string, actionType: string, value: number = 1) {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daily = await db.collection('dailyQuests').findOne({ userId, date: today });
    if (!daily) return;

    let updated = false;
    const newQuests = daily.quests.map((q: any) => {
        if (!q.completed && q.type === actionType) {
            q.progress += value;
            if (q.progress >= q.requirement) {
                q.progress = q.requirement;
                q.completed = true;
                // Note: XP awarding happens in the API route that calls this, usually
                updated = true;
            }
            updated = true;
        }
        return q;
    });

    if (updated) {
        await db.collection('dailyQuests').updateOne(
            { _id: daily._id },
            { $set: { quests: newQuests, lastUpdated: new Date() } }
        );
    }

    return newQuests.filter((q: any) => q.completed); // Return completed quests
}
