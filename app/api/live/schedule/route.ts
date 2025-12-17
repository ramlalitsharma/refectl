// POST /api/live/schedule - Schedule a live class
// GET /api/live/schedule - Get scheduled classes
// PUT /api/live/schedule/[roomId] - Update scheduled class
// DELETE /api/live/schedule/[roomId] - Cancel scheduled class

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeString } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const {
      roomName,
      courseId,
      scheduledStartTime,
      scheduledEndTime,
      timezone = 'UTC',
      description,
      isRecurring = false,
      recurrencePattern,
      maxParticipants = 50,
      enableRecording = true,
      enableScreenshare = true,
      enableChat = true,
      enableWhiteboard = false,
    } = body;

    if (!roomName || !scheduledStartTime) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'roomName and scheduledStartTime are required',
        400
      );
    }

    const startTime = new Date(scheduledStartTime);
    const endTime = scheduledEndTime ? new Date(scheduledEndTime) : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    if (startTime < new Date()) {
      return createErrorResponse(
        new Error('Invalid time'),
        'Scheduled start time must be in the future',
        400
      );
    }

    if (endTime <= startTime) {
      return createErrorResponse(
        new Error('Invalid time'),
        'End time must be after start time',
        400
      );
    }

    const db = await getDatabase();
    
    // Generate room ID
    const roomId = sanitizeString(roomName.toLowerCase().replace(/\s+/g, '-'), 50)
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now().toString(36);

    const roomUrl = `https://meet.jit.si/${roomId}`;

    const roomData = {
      roomId,
      roomName: sanitizeString(roomName, 200),
      roomUrl,
      provider: 'jitsi',
      courseId: courseId || null,
      createdBy: userId,
      status: 'scheduled',
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      timezone,
      description: description ? sanitizeString(description, 1000) : undefined,
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? (recurrencePattern || 'weekly') : undefined,
      maxParticipants: Math.max(1, Math.min(1000, parseInt(String(maxParticipants)) || 50)),
      enableRecording: enableRecording ?? true,
      enableScreenshare: enableScreenshare ?? true,
      enableChat: enableChat ?? true,
      enableWhiteboard: enableWhiteboard ?? false,
      enableWaitingRoom: false,
      enableBreakoutRooms: false,
      totalParticipants: 0,
      peakParticipants: 0,
      config: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('liveRooms').insertOne(roomData);

    // TODO: Schedule notification emails
    // TODO: Add to calendar if integration exists

    return createSuccessResponse({
      room: {
        ...roomData,
        id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to schedule class', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status'); // 'scheduled', 'active', 'ended'
    const upcoming = searchParams.get('upcoming') === 'true';

    const db = await getDatabase();
    const query: any = {};

    // Filter by course if provided
    if (courseId) {
      query.courseId = courseId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else if (upcoming) {
      // Get upcoming classes
      query.scheduledStartTime = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'active'] };
    }

    // Get user's classes or all if admin
    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    if (!isAdmin) {
      // Students see classes they're enrolled in or public classes
      if (courseId) {
        // Check enrollment
        const enrollment = await db.collection('enrollments').findOne({
          userId,
          courseId,
          status: 'approved',
        });
        if (!enrollment) {
          query.createdBy = userId; // Only their own classes
        }
      } else {
        // Show public classes or enrolled course classes
        query.$or = [
          { createdBy: userId },
          { status: 'scheduled', courseId: { $exists: false } }, // Public classes
        ];
      }
    }

    const rooms = await db
      .collection('liveRooms')
      .find(query)
      .sort({ scheduledStartTime: 1 })
      .limit(100)
      .toArray();

    return createSuccessResponse({ rooms });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch scheduled classes', 500);
  }
}

