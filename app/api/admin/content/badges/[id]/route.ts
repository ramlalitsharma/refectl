// PUT /api/admin/content/badges/[id] - Update badge
// DELETE /api/admin/content/badges/[id] - Deactivate badge

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { BADGES_COLLECTION } from '@/lib/models/BadgeDefinition';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { _id, ...updateData } = body; // Don't allow _id update

        const db = await getDatabase();
        await db.collection(BADGES_COLLECTION).updateOne(
            { id: params.id },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true, message: 'Badge updated' });
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
        // Soft delete
        await db.collection(BADGES_COLLECTION).updateOne(
            { id: params.id },
            { $set: { active: false, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true, message: 'Badge deactivated' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
