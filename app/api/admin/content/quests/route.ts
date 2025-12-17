// GET /api/admin/content/quests - List all quests
// POST /api/admin/content/quests - Create quest template

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { QUEST_TEMPLATES_COLLECTION, QuestTemplate } from '@/lib/models/QuestTemplate';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const db = await getDatabase();
        const quests = await db.collection(QUEST_TEMPLATES_COLLECTION)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ success: true, data: quests });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const newQuest: QuestTemplate = {
            ...body,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const db = await getDatabase();
        await db.collection(QUEST_TEMPLATES_COLLECTION).insertOne(newQuest);

        return NextResponse.json({ success: true, data: newQuest });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
