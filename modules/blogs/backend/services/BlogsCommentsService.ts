import { ObjectId } from 'mongodb';
import { auth, currentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { FeatureModule } from '@/modules/core/shared';

export class BlogsCommentsService extends FeatureModule {
  constructor() {
    super('blogs-comments');
  }

  async getTreeBySlug(slug: string) {
    const db = await getDatabase();
    const comments = await db
      .collection('blog_comments')
      .find({ blogSlug: slug })
      .sort({ createdAt: 1 })
      .toArray();

    const commentMap = new Map<string, any>();
    const roots: any[] = [];

    comments.forEach((comment: any) => {
      comment.replies = [];
      commentMap.set(comment._id.toString(), comment);
    });

    comments.forEach((comment: any) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId.toString());
        if (parent) parent.replies.push(comment);
        else roots.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }

  async createBySlug(input: { slug: string; content: string; parentId?: string | null }) {
    const user = await currentUser();
    if (!user) return { error: 'Unauthorized', status: 401 as const };

    if (!input.content || input.content.trim().length === 0) {
      return { error: 'Comment content is required', status: 400 as const };
    }

    const db = await getDatabase();
    const newComment: any = {
      blogSlug: input.slug,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      userImage: (user as any).imageUrl || (user as any).image || '',
      content: input.content.trim(),
      parentId:
        input.parentId && ObjectId.isValid(input.parentId) ? new ObjectId(input.parentId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('blog_comments').insertOne(newComment);
    return { comment: { ...newComment, _id: result.insertedId } };
  }

  async deleteById(commentId: string) {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized', status: 401 as const };
    if (!commentId) return { error: 'Comment ID required', status: 400 as const };
    if (!ObjectId.isValid(commentId)) return { error: 'Invalid comment ID', status: 400 as const };

    const db = await getDatabase();
    const comment = await db.collection('blog_comments').findOne({ _id: new ObjectId(commentId) });
    if (!comment) return { error: 'Comment not found', status: 404 as const };
    if (comment.userId !== userId) return { error: 'Forbidden', status: 403 as const };

    await db.collection('blog_comments').deleteOne({ _id: new ObjectId(commentId) });
    return { success: true as const };
  }
}

