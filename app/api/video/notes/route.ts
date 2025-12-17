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
    const { playbackId, timestamp, note, courseId, lessonId } = body;

    if (!playbackId || timestamp === undefined || !note) {
      return NextResponse.json(
        { error: 'playbackId, timestamp, and note are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const videoNote = {
      userId,
      playbackId,
      timestamp: parseFloat(timestamp),
      note: note.trim(),
      courseId: courseId || undefined,
      lessonId: lessonId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('videoNotes').insertOne(videoNote);

    return NextResponse.json({ success: true, note: videoNote });
  } catch (error: any) {
    console.error('Video note creation error:', error);
    return NextResponse.json(
      { error: 'Failed to save note', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const playbackId = searchParams.get('playbackId');
    const courseId = searchParams.get('courseId');

    const db = await getDatabase();
    const query: any = { userId };

    if (playbackId) query.playbackId = playbackId;
    if (courseId) query.courseId = courseId;

    const notes = await db
      .collection('videoNotes')
      .find(query)
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('Video notes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', message: error.message },
      { status: 500 }
    );
  }
}

