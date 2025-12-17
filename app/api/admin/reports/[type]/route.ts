// GET /api/admin/reports/[type] - Download Admin Reports (CSV)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { generateAdminReport } from '@/lib/export-service';

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const type = params.type as 'users' | 'activity' | 'gamification';
        if (!['users', 'activity', 'gamification'].includes(type)) {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        const csvData = await generateAdminReport(type);

        // Set headers for CSV download
        const headers = new Headers();
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', `attachment; filename="report-${type}-${new Date().toISOString().split('T')[0]}.csv"`);

        return new NextResponse(csvData, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Admin Report Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
