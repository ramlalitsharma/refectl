import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeDiscussionPost } from '@/lib/models/Discussion';
import type { DiscussionPost } from '@/lib/models/Discussion';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const subjectId = searchParams.get('subjectId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const db = await getDatabase();
    const query: any = {};

    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (subjectId) query.subjectId = subjectId;

    const posts = await db
      .collection<DiscussionPost>('discussions')
      .find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const serialized = posts.map(serializeDiscussionPost);

    return NextResponse.json({ posts: serialized, total: serialized.length });
  } catch (error: any) {
    console.error('Discussions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, courseId, lessonId, subjectId, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Get user info
    const user = await db.collection('users').findOne({ clerkId: userId });
    
    const post = {
      title: title.trim(),
      content: content.trim(),
      courseId: courseId || undefined,
      lessonId: lessonId || undefined,
      subjectId: subjectId || undefined,
      authorId: userId,
      authorName: user?.name || user?.email || 'Anonymous',
      authorAvatar: user?.avatar || undefined,
      tags: Array.isArray(tags) ? tags : [],
      isPinned: false,
      isLocked: false,
      views: 0,
      upvotes: 0,
      downvotes: 0,
      replies: [],
      replyCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('discussions').insertOne(post);
    const created = await db.collection('discussions').findOne({ _id: result.insertedId });

    return NextResponse.json({ post: serializeDiscussionPost(created as any) });
  } catch (error: any) {
    console.error('Discussion creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion', message: error.message },
      { status: 500 }
    );
  }
}

