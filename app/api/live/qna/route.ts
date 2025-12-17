// POST /api/live/qna/raise - Raise hand / Ask question
// GET /api/live/qna?roomId=xxx - Get Q&A queue
// POST /api/live/qna/resolve - Resolve question (instructor)
// POST /api/live/qna/prioritize - Prioritize question

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeString } from '@/lib/security';

interface HandRaise {
  _id?: any;
  roomId: string;
  userId: string;
  userName: string;
  question?: string;
  priority: number;
  status: 'pending' | 'acknowledged' | 'resolved';
  raisedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { action, roomId, question } = body;

    if (!action || !roomId) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'action and roomId are required',
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

    // Get user info
    const user = await db.collection('users').findOne({ clerkId: userId });
    const userName = user?.name || user?.email || 'User';

    if (action === 'raise') {
      // Check if user already has a pending question
      const existing = await db.collection('liveClassHandRaises').findOne({
        roomId,
        userId,
        status: 'pending',
      });

      if (existing) {
        return createSuccessResponse({
          handRaise: existing,
          message: 'Hand already raised',
        });
      }

      // Get current max priority
      const maxPriority = await db
        .collection('liveClassHandRaises')
        .findOne(
          { roomId, status: 'pending' },
          { sort: { priority: -1 } }
        );

      const handRaise: HandRaise = {
        roomId,
        userId,
        userName,
        question: question ? sanitizeString(question, 500) : undefined,
        priority: maxPriority ? (maxPriority.priority + 1) : 1,
        status: 'pending',
        raisedAt: new Date(),
      };

      const result = await db.collection('liveClassHandRaises').insertOne(handRaise);

      return createSuccessResponse({
        handRaise: { ...handRaise, _id: result.insertedId },
        message: 'Hand raised successfully',
      });
    } else if (action === 'lower') {
      // Lower hand / Cancel question
      await db.collection('liveClassHandRaises').updateOne(
        { roomId, userId, status: 'pending' },
        {
          $set: {
            status: 'resolved',
            resolvedAt: new Date(),
          },
        }
      );

      return createSuccessResponse({
        message: 'Hand lowered',
      });
    }

    return createErrorResponse(
      new Error('Invalid action'),
      'Action must be "raise" or "lower"',
      400
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to process hand raise', 500);
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
    const room = await db.collection('liveRooms').findOne({ roomId });

    if (!room) {
      return createErrorResponse(
        new Error('Room not found'),
        'Room not found',
        404
      );
    }

    // Get pending questions
    const handRaises = await db
      .collection<HandRaise>('liveClassHandRaises')
      .find({
        roomId,
        status: 'pending',
      })
      .sort({ priority: 1, raisedAt: 1 })
      .toArray();

    // Get acknowledged questions
    const acknowledged = await db
      .collection<HandRaise>('liveClassHandRaises')
      .find({
        roomId,
        status: 'acknowledged',
      })
      .sort({ acknowledgedAt: -1 })
      .limit(10)
      .toArray();

    return createSuccessResponse({
      pending: handRaises,
      acknowledged,
      total: handRaises.length,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch Q&A queue', 500);
  }
}

// PUT /api/live/qna - Update question status (acknowledge, resolve, prioritize)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { handRaiseId, action, priority } = body;

    if (!handRaiseId || !action) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'handRaiseId and action are required',
        400
      );
    }

    const db = await getDatabase();
    const handRaise = await db
      .collection<HandRaise>('liveClassHandRaises')
      .findOne({ _id: handRaiseId });

    if (!handRaise) {
      return createErrorResponse(
        new Error('Hand raise not found'),
        'Hand raise not found',
        404
      );
    }

    // Check if user is instructor
    const room = await db.collection('liveRooms').findOne({ roomId: handRaise.roomId });
    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isInstructor = room?.createdBy === userId;

    if (!isAdmin && !isInstructor) {
      return createErrorResponse(
        new Error('Forbidden'),
        'Only instructors can manage Q&A queue',
        403
      );
    }

    if (action === 'acknowledge') {
      await db.collection('liveClassHandRaises').updateOne(
        { _id: handRaiseId },
        {
          $set: {
            status: 'acknowledged',
            acknowledgedAt: new Date(),
            acknowledgedBy: userId,
          },
        }
      );
    } else if (action === 'resolve') {
      await db.collection('liveClassHandRaises').updateOne(
        { _id: handRaiseId },
        {
          $set: {
            status: 'resolved',
            resolvedAt: new Date(),
          },
        }
      );
    } else if (action === 'prioritize' && priority !== undefined) {
      await db.collection('liveClassHandRaises').updateOne(
        { _id: handRaiseId },
        {
          $set: {
            priority: parseInt(String(priority)),
          },
        }
      );
    }

    return createSuccessResponse({
      message: `Question ${action}d successfully`,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to update question', 500);
  }
}

