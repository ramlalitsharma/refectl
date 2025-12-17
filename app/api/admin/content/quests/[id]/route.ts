// PUT /api/admin/content/quests/[id] - Update quest
// DELETE /api/admin/content/quests/[id] - Deactivate quest

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { QUEST_TEMPLATES_COLLECTION } from '@/lib/models/QuestTemplate';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { _id, ...updateData } = body;

        const db = await getDatabase();
        await db.collection(QUEST_TEMPLATES_COLLECTION).updateOne(
            { id: params.id },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true, message: 'Quest template updated' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const db = await getDatabase();
        await db.collection(QUEST_TEMPLATES_COLLECTION).updateOne(
            { id: params.id },
            { $set: { active: false, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true, message: 'Quest template deactivated' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
