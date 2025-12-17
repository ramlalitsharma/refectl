// POST /api/live/student/resources - Add resource to class (instructor)
// GET /api/live/student/resources?roomId=xxx - Get class resources

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeString, isValidUrl } from '@/lib/security';

interface ClassResource {
  _id?: any;
  roomId: string;
  createdBy: string;
  title: string;
  description?: string;
  type: 'file' | 'link' | 'document' | 'video' | 'image';
  url: string;
  fileSize?: number;
  mimeType?: string;
  order: number;
  createdAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(new Error('Unauthorized'), 'Unauthorized', 401);
    }

    const body = await req.json();
    const { roomId, title, description, type, url, fileSize, mimeType } = body;

    if (!roomId || !title || !type || !url) {
      return createErrorResponse(
        new Error('Missing required fields'),
        'roomId, title, type, and url are required',
        400
      );
    }

    // Validate URL
    if (!isValidUrl(url) && type !== 'file') {
      return createErrorResponse(
        new Error('Invalid URL'),
        'url must be a valid HTTP/HTTPS URL',
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

    // Check if user is instructor
    const user = await db.collection('users').findOne({ clerkId: userId });
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isInstructor = room.createdBy === userId;

    if (!isAdmin && !isInstructor) {
      return createErrorResponse(
        new Error('Forbidden'),
        'Only instructors can add resources',
        403
      );
    }

    // Get current max order
    const maxOrder = await db
      .collection('liveClassResources')
      .findOne(
        { roomId },
        { sort: { order: -1 } }
      );

    const resource: ClassResource = {
      roomId,
      createdBy: userId,
      title: sanitizeString(title, 200),
      description: description ? sanitizeString(description, 1000) : undefined,
      type: type as ClassResource['type'],
      url,
      fileSize,
      mimeType,
      order: maxOrder ? maxOrder.order + 1 : 1,
      createdAt: new Date(),
    };

    const result = await db.collection('liveClassResources').insertOne(resource);

    return createSuccessResponse({
      resource: { ...resource, _id: result.insertedId },
      message: 'Resource added',
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to add resource', 500);
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
    const resources = await db
      .collection<ClassResource>('liveClassResources')
      .find({ roomId })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return createSuccessResponse({ resources });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch resources', 500);
  }
}

