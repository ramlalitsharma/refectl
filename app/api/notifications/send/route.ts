// POST /api/notifications/send - Send a notification (internal use)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        // This endpoint can be used internally or by authenticated users
        const { userId } = await auth();

        const body = await request.json();
        const {
            userId: targetUserId,
            type,
            title,
            message,
            icon,
            priority,
            metadata
        } = body;

        // Use either the targetUserId or the authenticated userId
        const recipientUserId = targetUserId || userId;

        if (!recipientUserId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        if (!type || !title || !message) {
            return NextResponse.json(
                { error: 'type, title, and message are required' },
                { status: 400 }
            );
        }

        const notification = await sendNotification({
            userId: recipientUserId,
            type,
            title,
            message,
            icon,
            priority,
            metadata,
        });

        return NextResponse.json({
            success: true,
            data: {
                notification,
            },
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
