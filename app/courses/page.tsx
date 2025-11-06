import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';

export const dynamic = 'force-dynamic';

export default async function CoursesIndexPage() {
  let courses: any[] = [];
  try {
    const db = await getDatabase();
    courses = await db.collection('courses').find({ status: { $ne: 'draft' } }).project({ title:1, slug:1, summary:1, subject:1, level:1, createdAt:1 }).sort({ createdAt: -1 }).limit(100).toArray();
  } catch (e) {
    courses = [];
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/admin/studio" className="text-blue-600 hover:underline">Admin Studio →</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Courses</h1>
        {!courses.length ? (
          <p className="text-gray-600">No courses published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <Link key={c.slug} href={`/courses/${c.slug}`}>
                <Card hover>
                  <CardHeader>
                    <CardTitle>{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{c.summary || 'A comprehensive, adaptive course.'}</p>
                    <p className="text-xs text-gray-500">{c.subject || 'General'} {c.level ? `• ${c.level}` : ''}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


