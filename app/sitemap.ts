import { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { NewsService } from '@/lib/news-service';
import { CourseServiceNeon } from '@/lib/course-service-neon';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';

  const { locales } = await import('@/lib/navigation');

  // Base routes to be localized
  const baseRoutes = [
    '',
    '/courses',
    '/subjects',
    '/blog',
    '/news',
    '/shop',
    '/live',
    '/about',
    '/contact',
    '/careers',
    '/pricing',
    '/learning-paths',
    '/privacy',
    '/terms',
  ];

  // Generate localized static routes
  const routes = baseRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.9,
    }))
  );

  // Dynamic routes
  let courseRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];
  let newsRoutes: MetadataRoute.Sitemap = [];

  try {
    const db = await getDatabase();

    // Only published courses
    const courses = await db.collection('courses')
      .find({ status: 'published' })
      .project({ slug: 1, updatedAt: 1 })
      .toArray();

    courseRoutes = courses.flatMap((course: any) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/courses/${course.slug}`,
        lastModified: new Date(course.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );

    // Published blogs (MongoDB legacy)
    const blogs = await db.collection('blogs')
      .find({ status: 'published' })
      .project({ slug: 1, updatedAt: 1, createdAt: 1 })
      .toArray();

    blogRoutes = blogs.flatMap((blog: any) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    );

    // Published News (Supabase)
    const newsItems = await NewsService.getPublishedNews();
    newsRoutes = newsItems.flatMap((item: any) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/news/${item.slug}`,
        lastModified: new Date(item.updated_at || item.published_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );

    // New Courses (Neon)
    const neonCourses = await CourseServiceNeon.getAllCourses();
    const neonCourseRoutes = neonCourses.flatMap((course: any) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/courses/${course.slug}`,
        lastModified: new Date(course.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }))
    );

    courseRoutes = [...courseRoutes, ...neonCourseRoutes];

  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...routes, ...courseRoutes, ...blogRoutes, ...newsRoutes];
}
