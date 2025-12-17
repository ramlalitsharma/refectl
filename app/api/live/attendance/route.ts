// POST /api/live/attendance - Track participant join/leave
// GET /api/live/attendance?roomId=xxx - Get attendance for a room

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { LiveClassAttendance } from '@/lib/models/LiveRoom';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { roomId, action, userName } = body;

    if (!roomId || !action) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'roomId and action are required',
        400
      );
    }

    if (!['join', 'leave'].includes(action)) {
      return createErrorResponse(
        new Error('Invalid action'),
        'Action must be "join" or "leave"',
        400
      );
    }

    const db = await getDatabase();
    const attendanceCollection = db.collection<LiveClassAttendance>('liveClassAttendance');

    if (action === 'join') {
      // Check if user already has an active session
      const existing = await attendanceCollection.findOne({
        roomId,
        userId,
        leftAt: { $exists: false },
      });

      if (existing) {
        // User already joined, return existing record
        return createSuccessResponse({
          attendanceId: existing._id?.toString(),
          joinedAt: existing.joinedAt,
          message: 'Already joined',
        });
      }

      // Create new attendance record
      const attendance: LiveClassAttendance = {
        roomId,
        userId,
        userName: userName || 'User',
        joinedAt: new Date(),
        wasPresent: false,
        createdAt: new Date(),
      };

      const result = await attendanceCollection.insertOne(attendance);

      // Update room statistics
      await db.collection('liveRooms').updateOne(
        { roomId },
        {
          $inc: { totalParticipants: 1 },
          $set: { updatedAt: new Date() },
        }
      );

      return createSuccessResponse({
        attendanceId: result.insertedId.toString(),
        joinedAt: attendance.joinedAt,
        message: 'Joined successfully',
      });
    } else if (action === 'leave') {
      // Find active attendance record
      const attendance = await attendanceCollection.findOne({
        roomId,
        userId,
        leftAt: { $exists: false },
      });

      if (!attendance) {
        return createErrorResponse(
          new Error('No active session'),
          'No active session found',
          404
        );
      }

      const leftAt = new Date();
      const duration = Math.floor((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);

      // Update attendance record
      await attendanceCollection.updateOne(
        { _id: attendance._id },
        {
          $set: {
            leftAt,
            duration,
            updatedAt: new Date(),
          },
        }
      );

      return createSuccessResponse({
        attendanceId: attendance._id?.toString(),
        duration,
        message: 'Left successfully',
      });
    }
  } catch (error) {
    return createErrorResponse(error, 'Failed to track attendance', 500);
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

    if (!roomId) {
      return createErrorResponse(
        new Error('Missing roomId'),
        'roomId query parameter is required',
        400
      );
    }

    const db = await getDatabase();
    const attendanceCollection = db.collection<LiveClassAttendance>('liveClassAttendance');

    // Check if user is instructor/admin
    const room = await db.collection('liveRooms').findOne({ roomId });
    const isInstructor = room?.createdBy === userId;

    // Get attendance records
    const query: any = { roomId };
    if (!isInstructor) {
      // Students can only see their own attendance
      query.userId = userId;
    }

    const attendance = await attendanceCollection
      .find(query)
      .sort({ joinedAt: -1 })
      .toArray();

    // Calculate statistics
    const totalParticipants = new Set(attendance.map((a) => a.userId)).size;
    const activeParticipants = attendance.filter((a) => !a.leftAt).length;
    const averageDuration = attendance
      .filter((a) => a.duration)
      .reduce((sum, a) => sum + (a.duration || 0), 0) / attendance.filter((a) => a.duration).length || 0;

    return createSuccessResponse({
      attendance,
      statistics: {
        totalParticipants,
        activeParticipants,
        totalRecords: attendance.length,
        averageDuration: Math.round(averageDuration),
      },
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch attendance', 500);
  }
}

