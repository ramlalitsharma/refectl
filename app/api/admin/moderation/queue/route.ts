// GET /api/admin/moderation/queue - View pending reports (Admin only)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getModerationQueue } from '@/lib/moderation-service';
import { ReportStatus } from '@/lib/models/Report';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = (searchParams.get('status') || 'pending') as ReportStatus;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await getModerationQueue(status, limit, offset);

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Moderation Queue Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
