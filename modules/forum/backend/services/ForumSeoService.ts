import type { Metadata } from 'next';
import { SeoModule } from '@/modules/core/shared';

export class ForumSeoService extends SeoModule {
  constructor() {
    super('forum-seo');
  }

  buildPageMetadata(locale: string): Metadata {
    return {
      title: 'Forum & Peer Learning | Refectl',
      description:
        'Join the Refectl community forum for Q&A, teaching discussions, peer learning, and moderated knowledge sharing.',
      alternates: {
        canonical: `/${locale}/forum`,
      },
    };
  }
}
