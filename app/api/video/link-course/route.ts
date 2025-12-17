import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireAdmin();

    const body = await req.json();
    const { videoId, courseId } = body;

    if (!videoId || !courseId) {
      return NextResponse.json(
        { error: 'Video ID and Course ID are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Add video to course resources
    const { ObjectId } = await import('mongodb');
    await db.collection('courses').updateOne(
      { _id: new ObjectId(courseId) },
      {
        $addToSet: {
          resources: {
            type: 'video',
            label: 'Video',
            url: `/videos/${videoId}/playlist.m3u8`,
            videoId,
          },
        },
      }
    );

    // Track linked courses in video record
    await db.collection('videos').updateOne(
      { videoId },
      {
        $addToSet: { linkedCourses: courseId },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Video link error:', error);
    return NextResponse.json(
      { error: 'Failed to link video to course', message: error.message },
      { status: 500 }
    );
  }
}

