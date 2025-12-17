import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import Script from 'next/script';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
  } catch { }

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Script
        id="lesson-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href={`/courses/${slug}`}>
              <Button variant="outline" size="sm">← {course.title}</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link href="/courses" className="hover:underline">Courses</Link> / <Link href={`/courses/${slug}`} className="hover:underline">{course.title}</Link> / <span className="text-gray-900 dark:text-white">{lesson.title}</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Module: {module.title}</p>
          </div>

          {/* Video Player */}
          {lesson.videoUrl || lesson.videoId ? (
            <Card className="mb-8">
              <CardContent className="p-0">
                <VideoPlayer
                  videoUrl={lesson.videoUrl}
                  videoId={lesson.videoId}
                  title={lesson.title}
                  provider={lesson.videoProvider || 'youtube'}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Lesson Content */}
          {lesson.content && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{lesson.content}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {lesson.resources.map((r: any, i: number) => (
                    <li key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="text-2xl">
                        {r.type === 'pdf' ? '📄' : r.type === 'video' ? '🎥' : '🔗'}
                      </span>
                      <a href={r.url} target="_blank" rel="noopener" className="flex-1 text-blue-600 dark:text-blue-400 hover:underline">
                        <div className="font-medium">{r.title || r.url}</div>
                        {r.type && <div className="text-xs text-gray-500">{r.type.toUpperCase()}</div>}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Practice Quiz */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Practice Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <AdaptiveQuiz topic={lesson.title} initialDifficulty="medium" />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <Link href={`/courses/${slug}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              ← Back to Course
            </Link>
            <Button variant="outline">Next Lesson →</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

