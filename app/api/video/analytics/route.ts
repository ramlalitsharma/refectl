import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { playbackId, watchTime, currentTime, duration, event } = body;

    if (!playbackId) {
      return NextResponse.json({ error: 'playbackId is required' }, { status: 400 });
    }

    const db = await getDatabase();

    // Record watch time analytics
    const analytics = {
      userId,
      playbackId,
      watchTime: watchTime || 0,
      currentTime: currentTime || 0,
      duration: duration || 0,
      completionRate: duration > 0 ? ((currentTime || 0) / duration) * 100 : 0,
      event: event || 'watch', // watch, pause, seek, complete
      timestamp: new Date(),
    };

    await db.collection('videoAnalytics').insertOne(analytics);

    // Update aggregated stats
    await db.collection('videoStats').updateOne(
      { playbackId, userId },
      {
        $inc: { totalWatchTime: watchTime || 0, viewCount: 1 },
        $set: {
          lastWatchedAt: new Date(),
          lastPosition: currentTime || 0,
          completionRate: analytics.completionRate,
        },
        $setOnInsert: {
          playbackId,
          userId,
          firstWatchedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Video analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = req.nextUrl.searchParams;
    const playbackId = searchParams.get('playbackId');

    const db = await getDatabase();
    const query: any = {};

    if (playbackId) query.playbackId = playbackId;
    if (userId) query.userId = userId;

    // Get aggregated stats
    const stats = await db.collection('videoStats').find(query).toArray();

    // Get drop-off points
    const dropOffPoints = await db
      .collection('videoAnalytics')
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { $floor: { $multiply: ['$currentTime', 0.1] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return NextResponse.json({ stats, dropOffPoints });
  } catch (error: any) {
    console.error('Video analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    );
  }
}

