// GET /api/admin/logs - View Audit Logs

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { getDatabase } from '@/lib/mongodb';
import { ADMIN_LOGS_COLLECTION } from '@/lib/models/AdminLog';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        // Security Check
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const adminId = searchParams.get('adminId');

        const db = await getDatabase();
        const query: any = {};
        if (adminId) query.adminId = adminId;

        const logs = await db.collection(ADMIN_LOGS_COLLECTION)
            .find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        const total = await db.collection(ADMIN_LOGS_COLLECTION).countDocuments(query);

        return NextResponse.json({
            success: true,
            data: {
                logs,
                total,
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
