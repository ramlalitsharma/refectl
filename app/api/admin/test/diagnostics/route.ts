// POST /api/admin/test/diagnostics - Run System Health Check

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { runGamificationDiagnostics } from '@/lib/diagnostics-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const report = await runGamificationDiagnostics(userId);
        const overallSuccess = report.every(r => r.success);

        return NextResponse.json({
            success: overallSuccess,
            data: report,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Diagnostics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
