// GET /api/admin/stats - System overview

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin, getSystemStats } from '@/lib/admin-service';

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

        const stats = await getSystemStats();

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
