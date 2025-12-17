// POST /api/admin/users/ban - Ban/Unban user

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin, toggleUserBan } from '@/lib/admin-service';

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

        const body = await request.json();
        const { targetUserId, ban, reason } = body;

        if (!targetUserId || typeof ban !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid parameters' },
                { status: 400 }
            );
        }

        // Prevent self-ban
        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'You cannot ban yourself' },
                { status: 400 }
            );
        }

        await toggleUserBan(userId, targetUserId, ban, reason);

        return NextResponse.json({
            success: true,
            message: `User ${ban ? 'banned' : 'unbanned'} successfully`,
        });
    } catch (error) {
        console.error('Error banning user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
