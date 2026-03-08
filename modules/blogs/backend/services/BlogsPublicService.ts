import { getDatabase } from '@/lib/mongodb';
import { FeatureModule } from '@/modules/core/shared';

export class BlogsPublicService extends FeatureModule {
  constructor() {
    super('blogs-public');
  }

  async getPublishedPosts() {
    const db = await getDatabase();
    return db.collection('blogs').find({ status: 'published' }).sort({ createdAt: -1 }).toArray();
  }

  async getPublishedPostBySlug(slug: string) {
    const db = await getDatabase();
    return db.collection('blogs').findOne({ slug, status: 'published' });
  }
}

