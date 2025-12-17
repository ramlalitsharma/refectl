// POST /api/moderation/report - Submit a report (User facing)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createReport } from '@/lib/moderation-service';
import { ReportReason, ReportTargetType } from '@/lib/models/Report';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reportedId, targetType, reason, description } = body;

        // Basic Validation
        if (!reportedId || !targetType || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate Status/Types (optional but good practice)
        const validTypes: ReportTargetType[] = ['user', 'activity', 'comment'];
        const validReasons: ReportReason[] = ['harassment', 'hate_speech', 'spam', 'inappropriate', 'other'];

        if (!validTypes.includes(targetType) || !validReasons.includes(reason)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        const report = await createReport({
            reporterId: userId,
            reportedId,
            targetType,
            reason,
            description
        });

        return NextResponse.json({ success: true, message: 'Report submitted successfully', data: report });
    } catch (error: any) {
        if (error.message === 'You have already reported this item.') {
            return NextResponse.json({ error: error.message }, { status: 409 }); // Conflict
        }
        console.error('Report Submission Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
