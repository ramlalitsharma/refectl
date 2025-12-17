// GET /api/admin/moderation/history/[userId] - View report history for a user

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getUserReportHistory } from '@/lib/moderation-service';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const targetUserId = params.userId;
        const history = await getUserReportHistory(targetUserId);

        return NextResponse.json({ success: true, data: history });
    } catch (error) {
        console.error('Moderation History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
