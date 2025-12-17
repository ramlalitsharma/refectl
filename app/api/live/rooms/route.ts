import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createJitsiRoom } from '@/lib/live/jitsi';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, courseId, maxParticipants, enableRecording, enableScreenshare, enableChat, enableWhiteboard } = body;

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Create Jitsi room (free, no API key needed)
    const room = createJitsiRoom({
      roomName: name,
      isModerator: true,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
    });

    // Save room to database
    const db = await getDatabase();
    await db.collection('liveRooms').insertOne({
      roomId: room.roomName,
      roomName: room.roomName,
      roomUrl: room.roomUrl,
      provider: 'jitsi',
      courseId: courseId || null,
      createdBy: userId,
      createdAt: new Date(),
      status: 'scheduled',
      config: room.config,
    });

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error('Live room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create live room', message: error.message },
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
    const roomName = searchParams.get('roomName');

    if (roomName) {
      // Create Jitsi room on-the-fly (free, no API needed)
      const room = createJitsiRoom({ roomName });
      return NextResponse.json({ room });
    }

    // Get user's rooms
    const db = await getDatabase();
    const rooms = await db
      .collection('liveRooms')
      .find({ createdBy: userId, provider: 'jitsi' })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ rooms });
  } catch (error: any) {
    console.error('Live room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live rooms', message: error.message },
      { status: 500 }
    );
  }
}

