import { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';

  // Static routes
  const routes = [
    '',
    '/courses',
    '/about',
    '/contact',
    '/pricing',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Dynamic routes (Courses)
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = await getDatabase();
    // Only published courses
    const courses = await db.collection('courses')
      .find({ status: 'published' })
      .project({ slug: 1, updatedAt: 1 })
      .toArray();

    courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: new Date(course.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...routes, ...courseRoutes];
}
