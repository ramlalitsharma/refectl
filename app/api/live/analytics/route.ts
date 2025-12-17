// GET /api/live/analytics?roomId=xxx - Get analytics for a room or all rooms

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const timeframe = searchParams.get('timeframe') || '30'; // days

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    const query: any = {};
    if (roomId) {
      query.roomId = roomId;
    } else if (!isAdmin) {
      // Non-admins only see their own classes
      query.createdBy = userId;
    }

    // Get rooms in timeframe
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
    query.createdAt = { $gte: daysAgo };

    const rooms = await db
      .collection('liveRooms')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Get attendance data
    const roomIds = rooms.map((r: any) => r.roomId);
    const attendance = await db
      .collection('liveClassAttendance')
      .find({ roomId: { $in: roomIds } })
      .toArray();

    // Get recordings
    const recordings = await db
      .collection('liveClassRecordings')
      .find({ roomId: { $in: roomIds } })
      .toArray();

    // Calculate statistics
    const stats = {
      totalClasses: rooms.length,
      totalParticipants: new Set(attendance.map((a: any) => a.userId)).size,
      totalAttendanceRecords: attendance.length,
      averageParticipantsPerClass: rooms.length > 0
        ? Math.round(attendance.length / rooms.length)
        : 0,
      totalRecordings: recordings.length,
      averageClassDuration: 0,
      peakConcurrentParticipants: Math.max(...rooms.map((r: any) => r.peakParticipants || 0), 0),
      classesByStatus: {
        scheduled: rooms.filter((r: any) => r.status === 'scheduled').length,
        active: rooms.filter((r: any) => r.status === 'active').length,
        ended: rooms.filter((r: any) => r.status === 'ended').length,
      },
    };

    // Calculate average duration
    const durations = attendance
      .filter((a: any) => a.duration)
      .map((a: any) => a.duration);
    if (durations.length > 0) {
      stats.averageClassDuration = Math.round(
        durations.reduce((sum: number, d: number) => sum + d, 0) / durations.length / 60
      ); // Convert to minutes
    }

    // Room-specific analytics
    const roomAnalytics = rooms.map((room: any) => {
      const roomAttendance = attendance.filter((a: any) => a.roomId === room.roomId);
      const roomRecordings = recordings.filter((r: any) => r.roomId === room.roomId);
      const uniqueParticipants = new Set(roomAttendance.map((a: any) => a.userId)).size;

      return {
        roomId: room.roomId,
        roomName: room.roomName,
        status: room.status,
        totalParticipants: uniqueParticipants,
        peakParticipants: room.peakParticipants || 0,
        totalAttendanceRecords: roomAttendance.length,
        recordings: roomRecordings.length,
        scheduledStartTime: room.scheduledStartTime,
        actualStartTime: room.actualStartTime,
        createdAt: room.createdAt,
      };
    });

    return createSuccessResponse({
      statistics: stats,
      rooms: roomAnalytics,
      timeframe: parseInt(timeframe),
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch analytics', 500);
  }
}

