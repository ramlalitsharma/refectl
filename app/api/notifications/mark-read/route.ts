// POST /api/notifications/mark-read - Mark notifications as read

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { markNotificationsAsRead } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { notificationIds, markAll } = body;

        let markedCount: number;

        if (markAll) {
            // Mark all unread notifications as read
            markedCount = await markNotificationsAsRead(userId);
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            markedCount = await markNotificationsAsRead(userId, notificationIds);
        } else {
            return NextResponse.json(
                { error: 'Invalid request. Provide notificationIds or markAll=true' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                markedCount,
            },
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
