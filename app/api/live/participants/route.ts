// GET /api/live/participants?roomId=xxx - Get participants in a room
// POST /api/live/participants/mute - Mute/unmute participant
// POST /api/live/participants/kick - Kick participant
// POST /api/live/participants/role - Change participant role

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

interface Participant {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'instructor' | 'ta' | 'student';
  joinedAt: Date;
  isMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  connectionQuality?: 'good' | 'medium' | 'poor';
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return createErrorResponse(
        new Error('Missing roomId'),
        'roomId query parameter is required',
        400
      );
    }

    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });

    if (!room) {
      return createErrorResponse(
        new Error('Room not found'),
        'Room not found',
        404
      );
    }

    // Get active participants from attendance
    const attendance = await db
      .collection('liveClassAttendance')
      .find({
        roomId,
        leftAt: { $exists: false },
      })
      .sort({ joinedAt: 1 })
      .toArray();

    // Get user details
    const userIds = attendance.map((a: any) => a.userId);
    const users = await db
      .collection('users')
      .find({ clerkId: { $in: userIds } })
      .toArray();

    const userMap = new Map(users.map((u: any) => [u.clerkId, u]));

    // Get hand raising status
    const handRaises = await db
      .collection('liveClassHandRaises')
      .find({
        roomId,
        resolved: false,
      })
      .toArray();

    const handRaiseMap = new Map(handRaises.map((h: any) => [h.userId, true]));

    const participants: Participant[] = attendance.map((a: any) => {
      const user = userMap.get(a.userId);
      const isInstructor = room.createdBy === a.userId;
      const isTA = false; // TODO: Implement TA assignment

      return {
        userId: a.userId,
        userName: user?.name || a.userName || 'User',
        userAvatar: user?.avatar || user?.imageUrl,
        role: isInstructor ? 'instructor' : isTA ? 'ta' : 'student',
        joinedAt: a.joinedAt,
        isMuted: false, // TODO: Get from Jitsi API
        isVideoMuted: false, // TODO: Get from Jitsi API
        isHandRaised: handRaiseMap.has(a.userId) || false,
        connectionQuality: 'good', // TODO: Get from Jitsi API
      };
    });

    // Sort: instructors first, then by join time
    participants.sort((a, b) => {
      if (a.role === 'instructor') return -1;
      if (b.role === 'instructor') return 1;
      if (a.role === 'ta') return -1;
      if (b.role === 'ta') return 1;
      return a.joinedAt.getTime() - b.joinedAt.getTime();
    });

    return createSuccessResponse({
      participants,
      total: participants.length,
      instructors: participants.filter((p) => p.role === 'instructor').length,
      students: participants.filter((p) => p.role === 'student').length,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch participants', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { action, roomId, targetUserId } = body;

    if (!action || !roomId || !targetUserId) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'action, roomId, and targetUserId are required',
        400
      );
    }

    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });

    if (!room) {
      return createErrorResponse(
        new Error('Room not found'),
        'Room not found',
        404
      );
    }

    // Check if user is instructor or admin
    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isInstructor = room.createdBy === userId;

    if (!isAdmin && !isInstructor) {
      return createErrorResponse(
        new Error('Forbidden'),
        'Only instructors can manage participants',
        403
      );
    }

    // Log moderation action
    await db.collection('liveClassModeration').insertOne({
      roomId,
      moderatorId: userId,
      targetUserId,
      action,
      timestamp: new Date(),
      metadata: body.metadata || {},
    });

    // Return action for frontend to execute via Jitsi API
    return createSuccessResponse({
      action,
      roomId,
      targetUserId,
      message: `Action ${action} executed`,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to execute participant action', 500);
  }
}

