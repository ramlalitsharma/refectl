// GET /api/live/recordings - Get recordings for a room or user
// POST /api/live/recordings - Save recording metadata

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { LiveClassRecording } from '@/lib/models/LiveRoom';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const {
      roomId,
      recordingId,
      recordingUrl,
      recordingType = 'local',
      duration,
      fileSize,
      thumbnail,
    } = body;

    if (!roomId || !recordingId) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'roomId and recordingId are required',
        400
      );
    }

    // Verify user has permission (instructor or admin)
    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });

    if (!room) {
      return createErrorResponse(
        new Error('Room not found'),
        'Room not found',
        404
      );
    }

    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isInstructor = room.createdBy === userId;

    if (!isAdmin && !isInstructor) {
      return createErrorResponse(
        new Error('Forbidden'),
        'Only instructors can save recordings',
        403
      );
    }

    const recording: LiveClassRecording = {
      roomId,
      recordingId,
      recordingUrl,
      recordingType: recordingType as 'local' | 'jibri',
      duration,
      fileSize,
      status: 'processing',
      thumbnail,
      createdAt: new Date(),
    };

    // Check if recording already exists
    const existing = await db
      .collection<LiveClassRecording>('liveClassRecordings')
      .findOne({ roomId, recordingId });

    if (existing) {
      // Update existing recording
      await db.collection('liveClassRecordings').updateOne(
        { _id: existing._id },
        {
          $set: {
            recordingUrl,
            duration,
            fileSize,
            thumbnail,
            status: recordingUrl ? 'ready' : 'processing',
            processedAt: recordingUrl ? new Date() : undefined,
            updatedAt: new Date(),
          },
        }
      );

      return createSuccessResponse({
        recording: { ...recording, _id: existing._id },
        message: 'Recording updated',
      });
    }

    // Create new recording
    const result = await db.collection('liveClassRecordings').insertOne(recording);

    // Update room to mark as recorded
    await db.collection('liveRooms').updateOne(
      { roomId },
      {
        $set: { updatedAt: new Date() },
      }
    );

    return createSuccessResponse({
      recording: { ...recording, _id: result.insertedId },
      message: 'Recording saved',
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to save recording', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    const db = await getDatabase();
    const query: any = {};

    if (roomId) {
      query.roomId = roomId;
    } else {
      // Get user's recordings (instructor or enrolled student)
      const user = await db.collection('users').findOne({ clerkId: userId });
      const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

      if (!isAdmin) {
        // Get rooms where user is instructor
        const instructorRooms = await db
          .collection('liveRooms')
          .find({ createdBy: userId })
          .project({ roomId: 1 })
          .toArray();

        const roomIds = instructorRooms.map((r: any) => r.roomId);

        // Also get recordings for courses user is enrolled in
        const enrollments = await db
          .collection('enrollments')
          .find({ userId, status: 'approved' })
          .project({ courseId: 1 })
          .toArray();

        const courseIds = enrollments.map((e: any) => e.courseId);
        const courseRooms = await db
          .collection('liveRooms')
          .find({ courseId: { $in: courseIds } })
          .project({ roomId: 1 })
          .toArray();

        const courseRoomIds = courseRooms.map((r: any) => r.roomId);
        const allRoomIds = [...roomIds, ...courseRoomIds];

        if (allRoomIds.length === 0) {
          return createSuccessResponse({ recordings: [] });
        }

        query.roomId = { $in: allRoomIds };
      }
    }

    const recordings = await db
      .collection<LiveClassRecording>('liveClassRecordings')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Get room information for each recording
    const roomIds = [...new Set(recordings.map((r) => r.roomId))];
    const rooms = await db
      .collection('liveRooms')
      .find({ roomId: { $in: roomIds } })
      .toArray();

    const roomMap = new Map(rooms.map((r: any) => [r.roomId, r]));

    const recordingsWithRooms = recordings.map((recording) => ({
      ...recording,
      room: roomMap.get(recording.roomId),
    }));

    return createSuccessResponse({ recordings: recordingsWithRooms });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch recordings', 500);
  }
}

