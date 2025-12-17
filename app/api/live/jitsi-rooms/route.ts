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
    const { name, courseId, isModerator, startWithAudioMuted, startWithVideoMuted, domain } = body;

    if (!name) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Create Jitsi room (free, no API key needed)
    const room = createJitsiRoom({
      roomName: name,
      domain: domain || undefined, // Use free public instance by default
      isModerator: isModerator !== false,
      startWithAudioMuted: startWithAudioMuted || false,
      startWithVideoMuted: startWithVideoMuted || false,
    });

    // Save room to database
    // Save room to database with all settings
    const db = await getDatabase();
    const roomData = {
      roomId: room.roomName,
      roomName: room.roomName,
      roomUrl: room.roomUrl,
      provider: 'jitsi',
      courseId: courseId || null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'scheduled',
      maxParticipants: maxParticipants || 50,
      enableRecording: enableRecording ?? true,
      enableScreenshare: enableScreenshare ?? true,
      enableChat: enableChat ?? true,
      enableWhiteboard: enableWhiteboard ?? false,
      enableWaitingRoom: false,
      enableBreakoutRooms: false,
      totalParticipants: 0,
      peakParticipants: 0,
      config: {
        ...room.config,
        // Apply settings to Jitsi config
        startWithAudioMuted: body.startWithAudioMuted || false,
        startWithVideoMuted: body.startWithVideoMuted || false,
        enableWelcomePage: false,
        enableClosePage: false,
        // Recording settings
        ...(enableRecording && {
          recordingService: {
            enabled: true,
          },
        }),
        // Chat settings
        ...(enableChat !== false && {
          disableChat: false,
        }),
        // Screen sharing
        ...(enableScreenshare !== false && {
          disableScreenSharing: false,
        }),
      },
    };
    
    const result = await db.collection('liveRooms').insertOne(roomData);

    return NextResponse.json({
      room: {
        ...room,
        id: result.insertedId.toString(),
        // Ensure other fields match frontend expectation
        roomId: room.roomName,
        status: 'scheduled'
      }
    });
  } catch (error: any) {
    console.error('Jitsi room creation error:', error);
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
      const { createJitsiRoom } = await import('@/lib/live/jitsi');
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
    console.error('Jitsi rooms fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live rooms', message: error.message },
      { status: 500 }
    );
  }
}


