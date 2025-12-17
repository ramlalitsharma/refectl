import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateContent, sanitizeInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 10;
const rateMap = new Map<string, { ts: number; count: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const typeParam = searchParams.get('type') || 'comment';
    const type = typeParam === 'qa' ? 'qa' : 'comment';
    const limitParam = searchParams.get('limit');
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '50', 10)));

    const db = await getDatabase();
    const comments = await db
      .collection('lessonComments')
      .find({
        lessonId,
        type,
        parentId: { $exists: false }, // Only top-level comments
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get replies for each comment
    const commentIds = comments.map((c: any) => String(c._id));
    const replies = commentIds.length > 0
      ? await db
          .collection('lessonComments')
          .find({ parentId: { $in: commentIds } })
          .sort({ createdAt: 1 })
          .toArray()
      : [];

    // Attach replies to comments
    const commentsWithReplies = comments.map((comment: any) => ({
      ...comment,
      id: String(comment._id),
      replies: replies
        .filter((r: any) => r.parentId === String(comment._id))
        .map((r: any) => ({ ...r, id: String(r._id) })),
    }));

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error: any) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await req.json();
    const { content, type = 'comment', parentId, isQuestion = false } = body;

    const validation = validateContent(String(content || ''), 3);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error || 'Invalid content' }, { status: 400 });
    }

    const safeContent = sanitizeInput(String(content));
    const finalType = type === 'qa' || isQuestion ? 'qa' : 'comment';

    if (parentId && !ObjectId.isValid(String(parentId))) {
      return NextResponse.json({ error: 'Invalid parentId' }, { status: 400 });
    }

    const key = `lesson-comment:${userId}:${lessonId}`;
    const nowTs = Date.now();
    const existing = rateMap.get(key);
    if (existing && nowTs - existing.ts < RATE_LIMIT_WINDOW_MS) {
      if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateMap.set(key, { ts: existing.ts, count: existing.count + 1 });
    } else {
      rateMap.set(key, { ts: nowTs, count: 1 });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comment = {
      lessonId,
      userId,
      userEmail: user.email,
      userName: user.name || user.firstName || 'Anonymous',
      content: safeContent,
      type: finalType,
      parentId: parentId || undefined,
      isResolved: false,
      upvotes: [],
      downvotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('lessonComments').insertOne(comment);
    const created = await db.collection('lessonComments').findOne({ _id: result.insertedId });

    return NextResponse.json({
      comment: { ...created, id: String(created?._id) },
      success: true,
    });
  } catch (error: any) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', message: error.message },
      { status: 500 }
    );
  }
}

