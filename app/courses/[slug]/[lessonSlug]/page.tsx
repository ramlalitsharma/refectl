import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await params;
  let course: any = null;
  let lesson: any = null;
  let module: any = null;
  try {
    const db = await getDatabase();
    course = await db.collection('courses').findOne({ slug });
    if (course) {
      for (const m of course.modules || []) {
        const l = (m.lessons || []).find((l: any) => l.slug === lessonSlug);
        if (l) {
          lesson = l;
          module = m;
          break;
        }
      }
    }
  } catch {}

  if (!course || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Lesson not found</h1>
        <Link href={`/courses/${slug}`} className="text-blue-600 hover:underline">← Back to Course</Link>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    courseCode: lesson.slug,
    description: lesson.content?.slice(0, 200) || lesson.title,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href={`/courses/${slug}`} className="text-blue-600 hover:underline">← {course.title}</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/courses" className="hover:underline">Courses</Link> / <Link href={`/courses/${slug}`} className="hover:underline">{course.title}</Link> / <span className="text-gray-900">{lesson.title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <p className="text-gray-600 mb-6">Module: {module.title}</p>
          {lesson.content && (
            <Card className="mb-8">
              <CardContent className="pt-6 prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">{lesson.content}</div>
              </CardContent>
            </Card>
          )}
          {lesson.resources && lesson.resources.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.resources.map((r: any, i: number) => (
                    <li key={i}>
                      <a href={r.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                        {r.title || r.url} {r.type && `(${r.type})`}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Practice Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <AdaptiveQuiz topic={lesson.title} initialDifficulty="medium" />
            </CardContent>
          </Card>
          <div className="flex justify-between items-center mt-8">
            <Link href={`/courses/${slug}`} className="text-blue-600 hover:underline">← Back to Course</Link>
            <div className="text-sm text-gray-600">Next lesson →</div>
          </div>
        </div>
      </main>
    </div>
  );
}

