import { ObjectId } from 'mongodb';
import { auth, currentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { FeatureModule } from '@/modules/core/shared';

export class TeraiTimesCommentsService extends FeatureModule {
  constructor() {
    super('terai-times-comments');
  }

  async getTreeBySlug(slug: string) {
    const db = await getDatabase();
    const comments = await db
      .collection('news_comments')
      .find({ newsSlug: slug })
      .sort({ createdAt: 1 })
      .toArray();

    const map = new Map<string, any>();
    const roots: any[] = [];

    comments.forEach((c: any) => {
      c.replies = [];
      map.set(c._id.toString(), c);
    });

    comments.forEach((c: any) => {
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) {
          parent.replies.push(c);
        } else {
          roots.push(c);
        }
      } else {
        roots.push(c);
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
    const doc: any = {
      newsSlug: input.slug,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      userImage: (user as any).imageUrl || (user as any).image || '',
      content: input.content.trim(),
      parentId:
        input.parentId && ObjectId.isValid(input.parentId) ? new ObjectId(input.parentId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('news_comments').insertOne(doc);
    return { comment: { ...doc, _id: result.insertedId } };
  }

  async deleteById(commentId: string) {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized', status: 401 as const };
    if (!commentId) return { error: 'Comment ID required', status: 400 as const };
    if (!ObjectId.isValid(commentId)) return { error: 'Invalid comment ID', status: 400 as const };

    const db = await getDatabase();
    const existing = await db.collection('news_comments').findOne({ _id: new ObjectId(commentId) });
    if (!existing) return { error: 'Comment not found', status: 404 as const };
    if (existing.userId !== userId) return { error: 'Forbidden', status: 403 as const };

    await db.collection('news_comments').deleteOne({ _id: new ObjectId(commentId) });
    return { success: true as const };
  }
}

