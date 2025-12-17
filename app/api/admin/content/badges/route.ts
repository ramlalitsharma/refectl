// GET /api/admin/content/badges - List all badges
// POST /api/admin/content/badges - Create a new badge

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { BADGES_COLLECTION, BadgeDefinition } from '@/lib/models/BadgeDefinition';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const db = await getDatabase();
        const badges = await db.collection(BADGES_COLLECTION)
            .find({})
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json({ success: true, data: badges });
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
        // Basic validation could go here
        const newBadge: BadgeDefinition = {
            ...body,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const db = await getDatabase();
        await db.collection(BADGES_COLLECTION).insertOne(newBadge);

        return NextResponse.json({ success: true, data: newBadge });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
