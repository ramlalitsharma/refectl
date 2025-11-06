import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let course: any = null;
  try {
    const db = await getDatabase();
    course = await db.collection('courses').findOne({ slug });
  } catch {}
  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <Link href="/courses" className="text-blue-600 hover:underline">← Back to Courses</Link>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';
  const canonical = `${baseUrl}/courses/${course.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary || 'An adaptive course by AdaptIQ',
    provider: { '@type': 'Organization', name: 'AdaptIQ', sameAs: baseUrl },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <head>
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/courses" className="text-blue-600 hover:underline">Courses</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.summary || `${course.subject || 'General'} {${course.level || ''}}`}</p>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {(course.modules || []).map((m: any) => (
              <section key={m.id} className="bg-white border rounded-xl p-4">
                <h2 className="text-xl font-semibold mb-3">{m.title}</h2>
                <ol className="list-decimal ml-5 space-y-2">
                  {(m.lessons || []).map((l: any) => (
                    <li key={l.id} className="text-gray-800">
                      <div className="font-medium">{l.title}</div>
                      {l.content ? <p className="text-sm text-gray-600 mt-1">{l.content.slice(0, 180)}...</p> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
          <aside className="space-y-4">
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-2">Course Info</h3>
              <p className="text-sm text-gray-600">Subject: {course.subject || 'General'}</p>
              <p className="text-sm text-gray-600">Level: {course.level || '—'}</p>
              <p className="text-sm text-gray-600">Lessons: {(course.modules || []).reduce((n:number,m:any)=>n+(m.lessons?.length||0),0)}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-2">Related</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li><Link href="/subjects">Practice by Subject</Link></li>
                <li><Link href="/blog">Latest Blogs</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


