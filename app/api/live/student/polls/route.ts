// POST /api/live/student/polls - Create poll (instructor)
// GET /api/live/student/polls?roomId=xxx - Get active polls
// POST /api/live/student/polls/vote - Vote on poll (student)
// POST /api/live/student/polls/close - Close poll (instructor)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeString } from '@/lib/security';

interface Poll {
  _id?: any;
  roomId: string;
  createdBy: string;
  question: string;
  options: string[];
  type: 'single' | 'multiple';
  status: 'active' | 'closed';
  votes: Array<{
    userId: string;
    selectedOptions: number[];
    votedAt: Date;
  }>;
  createdAt: Date;
  closedAt?: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { action, roomId, question, options, type, pollId, selectedOptions } = body;

    if (!roomId) {
      return createErrorResponse(
        new Error('Missing roomId'),
        'roomId is required',
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

    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isInstructor = room.createdBy === userId;

    if (action === 'create') {
      // Create poll (instructor only)
      if (!isAdmin && !isInstructor) {
        return createErrorResponse(
          new Error('Forbidden'),
          'Only instructors can create polls',
          403
        );
      }

      if (!question || !options || !Array.isArray(options) || options.length < 2) {
        return createErrorResponse(
          new Error('Invalid poll data'),
          'question and at least 2 options are required',
          400
        );
      }

      const poll: Poll = {
        roomId,
        createdBy: userId,
        question: sanitizeString(question, 500),
        options: options.map((opt: string) => sanitizeString(opt, 200)),
        type: type === 'multiple' ? 'multiple' : 'single',
        status: 'active',
        votes: [],
        createdAt: new Date(),
      };

      // Close any existing active polls in this room
      await db.collection('liveClassPolls').updateMany(
        { roomId, status: 'active' },
        {
          $set: {
            status: 'closed',
            closedAt: new Date(),
          },
        }
      );

      const result = await db.collection('liveClassPolls').insertOne(poll);

      return createSuccessResponse({
        poll: { ...poll, _id: result.insertedId },
        message: 'Poll created',
      });
    } else if (action === 'vote') {
      // Vote on poll (students)
      if (!pollId || !selectedOptions || !Array.isArray(selectedOptions)) {
        return createErrorResponse(
          new Error('Invalid vote data'),
          'pollId and selectedOptions are required',
          400
        );
      }

      const poll = await db.collection<Poll>('liveClassPolls').findOne({
        _id: pollId,
        roomId,
        status: 'active',
      });

      if (!poll) {
        return createErrorResponse(
          new Error('Poll not found'),
          'Active poll not found',
          404
        );
      }

      // Validate selected options
      const validOptions = selectedOptions.filter(
        (opt: number) => opt >= 0 && opt < poll.options.length
      );

      if (validOptions.length === 0) {
        return createErrorResponse(
          new Error('Invalid options'),
          'At least one valid option must be selected',
          400
        );
      }

      if (poll.type === 'single' && validOptions.length > 1) {
        return createErrorResponse(
          new Error('Invalid vote'),
          'Single choice poll allows only one option',
          400
        );
      }

      // Remove existing vote if any
      await db.collection('liveClassPolls').updateOne(
        { _id: pollId },
        {
          $pull: { votes: { userId } },
        }
      );

      // Add new vote
      await db.collection('liveClassPolls').updateOne(
        { _id: pollId },
        {
          $push: {
            votes: {
              userId,
              selectedOptions: validOptions,
              votedAt: new Date(),
            },
          },
        }
      );

      return createSuccessResponse({
        message: 'Vote recorded',
      });
    } else if (action === 'close') {
      // Close poll (instructor only)
      if (!isAdmin && !isInstructor) {
        return createErrorResponse(
          new Error('Forbidden'),
          'Only instructors can close polls',
          403
        );
      }

      if (!pollId) {
        return createErrorResponse(
          new Error('Missing pollId'),
          'pollId is required',
          400
        );
      }

      await db.collection('liveClassPolls').updateOne(
        { _id: pollId, roomId },
        {
          $set: {
            status: 'closed',
            closedAt: new Date(),
          },
        }
      );

      return createSuccessResponse({
        message: 'Poll closed',
      });
    }

    return createErrorResponse(
      new Error('Invalid action'),
      'Action must be "create", "vote", or "close"',
      400
    );
  } catch (error) {
    return createErrorResponse(error, 'Failed to process poll action', 500);
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

    // Get active polls
    const activePolls = await db
      .collection<Poll>('liveClassPolls')
      .find({
        roomId,
        status: 'active',
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Get recent closed polls
    const closedPolls = await db
      .collection<Poll>('liveClassPolls')
      .find({
        roomId,
        status: 'closed',
      })
      .sort({ closedAt: -1 })
      .limit(10)
      .toArray();

    // Check if user has voted
    const pollsWithVoteStatus = [...activePolls, ...closedPolls].map((poll) => {
      const hasVoted = poll.votes.some((v) => v.userId === userId);
      return {
        ...poll,
        hasVoted,
        totalVotes: poll.votes.length,
        // Calculate results (without showing individual votes for active polls)
        results: poll.status === 'closed'
          ? poll.options.map((_, index) => ({
              optionIndex: index,
              option: poll.options[index],
              votes: poll.votes.filter((v) => v.selectedOptions.includes(index)).length,
            }))
          : undefined,
      };
    });

    return createSuccessResponse({
      active: pollsWithVoteStatus.filter((p) => p.status === 'active'),
      closed: pollsWithVoteStatus.filter((p) => p.status === 'closed'),
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch polls', 500);
  }
}

