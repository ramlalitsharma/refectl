// PATCH /api/admin/users/role - Promote/Demote user

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin, updateUserRole } from '@/lib/admin-service';

export async function PATCH(request: NextRequest) {
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
        const { targetUserId, role } = body;

        if (!targetUserId || !['user', 'admin'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid parameters' },
                { status: 400 }
            );
        }

        // Prevent demoting self
        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'You cannot change your own role' },
                { status: 400 }
            );
        }

        await updateUserRole(userId, targetUserId, role);

        return NextResponse.json({
            success: true,
            message: `User role updated to ${role}`,
        });
    } catch (error) {
        console.error('Error updating role:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
