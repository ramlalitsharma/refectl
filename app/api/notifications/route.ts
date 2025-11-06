import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

// GET - Get user notifications
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    const query: any = { userId };
    if (unreadOnly) query.read = false;

    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const unreadCount = await db.collection('notifications').countDocuments({ userId, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch notifications', message: e.message }, { status: 500 });
  }
}

// POST - Create notification
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, title, message, link, userId: targetUserId } = body;

    const db = await getDatabase();
    const notification = {
      userId: targetUserId || userId,
      type: type || 'info',
      title,
      message,
      link,
      read: false,
      createdAt: new Date(),
    };

    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({ success: true, notification });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create notification', message: e.message }, { status: 500 });
  }
}

// PUT - Mark as read
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAll } = body;

    const db = await getDatabase();

    if (markAll) {
      await db.collection('notifications').updateMany(
        { userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
    } else if (notificationId) {
      await db.collection('notifications').updateOne(
        { _id: notificationId, userId },
        { $set: { read: true, readAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update notification', message: e.message }, { status: 500 });
  }
}

