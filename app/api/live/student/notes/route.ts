// POST /api/live/student/notes - Save student notes during class
// GET /api/live/student/notes?roomId=xxx - Get student notes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeString } from '@/lib/security';

interface StudentNote {
  _id?: any;
  roomId: string;
  userId: string;
  content: string;
  timestamp?: number; // Timestamp in class (seconds)
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { roomId, content, timestamp } = body;

    if (!roomId || !content) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'roomId and content are required',
        400
      );
    }

    const db = await getDatabase();
    const sanitizedContent = sanitizeString(content, 10000);

    // Check if note exists (update) or create new
    const existing = await db.collection('liveClassStudentNotes').findOne({
      roomId,
      userId,
      timestamp: timestamp || null,
    });

    const noteData: Partial<StudentNote> = {
      roomId,
      userId,
      content: sanitizedContent,
      timestamp: timestamp ? parseInt(String(timestamp)) : undefined,
      updatedAt: new Date(),
    };

    if (existing) {
      // Update existing note
      await db.collection('liveClassStudentNotes').updateOne(
        { _id: existing._id },
        { $set: noteData }
      );

      return createSuccessResponse({
        note: { ...noteData, _id: existing._id },
        message: 'Note updated',
      });
    } else {
      // Create new note
      const note: StudentNote = {
        ...noteData,
        createdAt: new Date(),
      } as StudentNote;

      const result = await db.collection('liveClassStudentNotes').insertOne(note);

      return createSuccessResponse({
        note: { ...note, _id: result.insertedId },
        message: 'Note saved',
      });
    }
  } catch (error) {
    return createErrorResponse(error, 'Failed to save note', 500);
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
    const notes = await db
      .collection<StudentNote>('liveClassStudentNotes')
      .find({
        roomId,
        userId,
      })
      .sort({ timestamp: 1, createdAt: 1 })
      .toArray();

    return createSuccessResponse({ notes });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch notes', 500);
  }
}

