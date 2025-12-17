import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeDiscussionPost, serializeDiscussionReply } from '@/lib/models/Discussion';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const { userId } = await auth();

    const db = await getDatabase();
    
    // Find post
    const post = await db.collection('discussions').findOne({
      $or: [{ _id: new ObjectId(postId) }, { id: postId }],
    });

    if (!post) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Increment view count (if not the author)
    if (userId && post.authorId !== userId) {
      await db.collection('discussions').updateOne(
        { _id: post._id },
        { $inc: { views: 1 } }
      );
      post.views = (post.views || 0) + 1;
    }

    return NextResponse.json({ post: serializeDiscussionPost(post as any) });
  } catch (error: any) {
    console.error('Discussion fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    const body = await req.json();
    const { content, parentReplyId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find post
    const post = await db.collection('discussions').findOne({
      $or: [{ _id: new ObjectId(postId) }, { id: postId }],
    });

    if (!post) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Get user info
    const user = await db.collection('users').findOne({ clerkId: userId });

    const reply = {
      postId: String(post._id),
      content: content.trim(),
      authorId: userId,
      authorName: user?.name || user?.email || 'Anonymous',
      authorAvatar: user?.avatar || undefined,
      parentReplyId: parentReplyId || undefined,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add reply to post
    await db.collection('discussions').updateOne(
      { _id: post._id },
      {
        $push: (({ replies: reply }) as unknown as import('mongodb').PushOperator<any>),
        $inc: { replyCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ reply: serializeDiscussionReply(reply as any) });
  } catch (error: any) {
    console.error('Reply creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reply', message: error.message },
      { status: 500 }
    );
  }
}

