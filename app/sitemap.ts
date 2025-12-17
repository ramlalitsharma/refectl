import { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/subjects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/exams`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  // subjects
  let subjectRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = await getDatabase();
    const subjects = await db.collection('subjects').find({ isActive: true }).project({ slug: 1 }).toArray();
    subjectRoutes = subjects
      .filter((s: any) => s.slug)
      .map((s: any) => ({ url: `${baseUrl}/subjects/${s.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }));
    const courses = await db.collection('courses').find({ status: { $ne: 'draft' } }).project({ slug: 1 }).toArray();
    const courseRoutes: MetadataRoute.Sitemap = courses
      .filter((c: any) => c.slug)
      .map((c: any) => ({ url: `${baseUrl}/courses/${c.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 })) as MetadataRoute.Sitemap;
    subjectRoutes = [...subjectRoutes, ...courseRoutes];
  } catch {
    subjectRoutes = [];
  }

  // exams
  const exams = [
    'sat','act','gre','gmat','ielts','toefl','mcat','lsat',
    'jee-main','jee-advanced','neet','gate','upsc-cse','ssc-cgl','ibps-po','cat','cuet','clat',
    'see','neb-grade-12','ioe','ku-entrance','mecce'
  ];
  const examRoutes: MetadataRoute.Sitemap = exams.map((e) => ({ url: `${baseUrl}/exams/${e}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }));

  return [...staticRoutes, ...subjectRoutes, ...examRoutes];
}
