import type { Metadata } from 'next';
import { BRAND_NAME, BRAND_URL } from '@/lib/brand';
import { SeoModule } from '@/modules/core/shared';

export class CoursesSeoService extends SeoModule {
  constructor() {
    super('courses-seo');
  }

  buildIndexMetadata(locale: string): Metadata {
    return {
      title: 'Courses | Refectl Library',
      description: 'Browse our expansive library of AI-powered adaptive courses and video classes.',
      alternates: {
        canonical: `/${locale}/courses`,
      },
    };
  }

  buildDetailFallbackMetadata(slug: string): Metadata {
    return {
      title: 'Course details',
      description: 'Explore detailed information about this course.',
      alternates: { canonical: `${BRAND_URL}/courses/${slug}` },
    };
  }

  buildNotFoundMetadata(slug: string): Metadata {
    return {
      title: 'Course not found',
      description: 'We could not find the course you were looking for.',
      alternates: { canonical: `${BRAND_URL}/courses/${slug}` },
    };
  }

  buildDetailMetadata(params: { slug: string; title?: string; description?: string }): Metadata {
    const { slug, title, description } = params;
    const safeTitle = title || 'Course details';
    const safeDescription = description || `An adaptive course by ${BRAND_NAME}`;

    return {
      title: safeTitle,
      description: safeDescription,
      alternates: { canonical: `${BRAND_URL}/courses/${slug}` },
      openGraph: {
        title: safeTitle,
        description: safeDescription,
        url: `${BRAND_URL}/courses/${slug}`,
        type: 'website',
      },
    };
  }
}
