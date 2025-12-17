// POST /api/admin/moderation/resolve - Resolve a report (Admin only)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { resolveReport } from '@/lib/moderation-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { reportId, action, resolutionNotes } = body;

        if (!reportId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['dismiss', 'warn', 'ban'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const result = await resolveReport({
            reportId,
            adminId: userId,
            action,
            resolutionNotes
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        if (error.message === 'Report not found') {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }
        console.error('Moderation Resolution Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
