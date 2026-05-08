import type { Metadata } from 'next';
import { BRAND_URL } from '@/lib/brand';
import { SeoModule } from '@/modules/core/shared';
import { BlogsPublicService } from './BlogsPublicService';

export class BlogsSeoService extends SeoModule {
  private readonly publicService = new BlogsPublicService();

  constructor() {
    super('blogs-seo');
  }

  async buildPageMetadata(params: Record<string, any>): Promise<Metadata> {
    const locale = (params?.locale as string | undefined) || 'en';
    return {
      title: 'Refectl Insights | Institutional Intelligence',
      description: 'Institutional analysis, deep-dive research reports, and academic insights from the Refectl Institutional Desk.',
      alternates: {
        canonical: `/${locale}/blog`,
      },
    };
  }

  async buildPostMetadata(slug: string): Promise<Metadata> {
    const post = await this.publicService.getPublishedPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post Not Found',
        alternates: { canonical: `${BRAND_URL}/blog/${slug}` },
      };
    }

    return {
      title: post.title,
      description: post.excerpt || post.title,
      alternates: { canonical: `${BRAND_URL}/blog/${slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  }
}

