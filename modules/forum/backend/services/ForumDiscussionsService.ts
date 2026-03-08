import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import {
  serializeDiscussionPost,
  serializeDiscussionReply,
  type DiscussionPost,
} from '@/lib/models/Discussion';
import { FeatureModule } from '@/modules/core/shared';

export class ForumDiscussionsService extends FeatureModule {
  constructor() {
    super('forum-discussions');
  }

  async list(input: {
    courseId?: string | null;
    lessonId?: string | null;
    subjectId?: string | null;
    limit: number;
    skip: number;
  }) {
    const db = await getDatabase();
    const query: any = {};
    if (input.courseId) query.courseId = input.courseId;
    if (input.lessonId) query.lessonId = input.lessonId;
    if (input.subjectId) query.subjectId = input.subjectId;

    const posts = await db
      .collection<DiscussionPost>('discussions')
      .find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(input.skip)
      .limit(input.limit)
      .toArray();

    const serialized = posts.map(serializeDiscussionPost);
    return { posts: serialized, total: serialized.length };
  }

  async create(input: {
    title?: string;
    content?: string;
    courseId?: string;
    lessonId?: string;
    subjectId?: string;
    tags?: string[];
  }) {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized', status: 401 as const };
    if (!input.title || !input.content) {
      return { error: 'Title and content are required', status: 400 as const };
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ clerkId: userId });

    const post = {
      title: input.title.trim(),
      content: input.content.trim(),
      courseId: input.courseId || undefined,
      lessonId: input.lessonId || undefined,
      subjectId: input.subjectId || undefined,
      authorId: userId,
      authorName: user?.name || user?.email || 'Anonymous',
      authorAvatar: user?.avatar || undefined,
      tags: Array.isArray(input.tags) ? input.tags : [],
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
    return { post: serializeDiscussionPost(created as any) };
  }

  async getById(postId: string) {
    const { userId } = await auth();
    const db = await getDatabase();

    const query = ObjectId.isValid(postId)
      ? { $or: [{ _id: new ObjectId(postId) }, { id: postId }] }
      : { id: postId };

    const post = await db.collection('discussions').findOne(query);
    if (!post) return { error: 'Discussion not found', status: 404 as const };

    if (userId && post.authorId !== userId) {
      await db.collection('discussions').updateOne({ _id: post._id }, { $inc: { views: 1 } });
      post.views = (post.views || 0) + 1;
    }

    return { post: serializeDiscussionPost(post as any) };
  }

  async addReply(postId: string, input: { content?: string; parentReplyId?: string }) {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized', status: 401 as const };
    if (!input.content || !input.content.trim()) {
      return { error: 'Reply content is required', status: 400 as const };
    }

    const db = await getDatabase();
    const query = ObjectId.isValid(postId)
      ? { $or: [{ _id: new ObjectId(postId) }, { id: postId }] }
      : { id: postId };
    const post = await db.collection('discussions').findOne(query);
    if (!post) return { error: 'Discussion not found', status: 404 as const };

    const user = await db.collection('users').findOne({ clerkId: userId });
    const reply = {
      postId: String(post._id),
      content: input.content.trim(),
      authorId: userId,
      authorName: user?.name || user?.email || 'Anonymous',
      authorAvatar: user?.avatar || undefined,
      parentReplyId: input.parentReplyId || undefined,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('discussions').updateOne(
      { _id: post._id },
      {
        $push: (({ replies: reply }) as unknown as import('mongodb').PushOperator<any>),
        $inc: { replyCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return { reply: serializeDiscussionReply(reply as any) };
  }
}

