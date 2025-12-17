// GET /api/notifications - Get user's notifications

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotifications } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const readFilter = searchParams.get('read');
    const typeFilter = searchParams.get('type');

    const options: any = { limit, offset };

    if (readFilter !== null) {
      options.read = readFilter === 'true';
    }

    if (typeFilter) {
      options.type = typeFilter;
    }

    const result = await getUserNotifications(userId, options);

    return NextResponse.json({
      success: true,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        total: result.total,
        hasMore: offset + limit < result.total,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
