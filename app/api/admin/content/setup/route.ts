// GET /api/admin/content/setup - Internal route to run seeding

import { NextRequest, NextResponse } from 'next/server';
import { seedContent } from '@/lib/cms-seed';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        // Security Check
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        const { badgesSeeded, questsSeeded } = await seedContent();

        return NextResponse.json({
            success: true,
            message: 'Content migration checked/completed',
            data: { badgesSeeded, questsSeeded }
        });
    } catch (error) {
        console.error('Error seeding content:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
