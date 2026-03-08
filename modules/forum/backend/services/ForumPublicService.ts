import { getDatabase } from '@/lib/mongodb';
import { serializeDiscussionPost } from '@/lib/models/Discussion';
import { FeatureModule } from '@/modules/core/shared';

export class ForumPublicService extends FeatureModule {
  constructor() {
    super('forum-public');
  }

  async getForumLandingPosts(limit = 25) {
    const db = await getDatabase();
    const posts = await db
      .collection('discussions')
      .find({})
      .sort({ isPinned: -1, replyCount: -1, createdAt: -1 })
      .limit(limit)
      .toArray()
      .catch(() => []);

    return posts.map((post: any) => {
      const clean = serializeDiscussionPost(post);
      return {
        ...clean,
        createdAt: clean.createdAt.toISOString(),
        updatedAt: clean.updatedAt.toISOString(),
      };
    });
  }
}
