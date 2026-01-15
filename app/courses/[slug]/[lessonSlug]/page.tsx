import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LessonVideoPlayer } from '@/components/courses/LessonVideoPlayer';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { auth } from '@/lib/auth';
import { Lock, FileText, MessageSquare } from 'lucide-react';
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; lessonSlug: string }> }
): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';
  try {
    const db = await getDatabase();
    const course = await db.collection('courses').findOne({ slug }, { projection: { title: 1, units: 1, modules: 1 } });
    let lessonTitle = lessonSlug;
    if (course) {
      const units = course.units || course.modules || [];
      for (const unit of units) {
        const chapters = unit.chapters || [{ lessons: unit.lessons || [] }];
        for (const chapter of chapters) {
          const l = (chapter.lessons || []).find((x: any) => x.slug === lessonSlug);
          if (l) {
            lessonTitle = l.title || lessonSlug;
            break;
          }
        }
      }
    }
    return {
      title: `${lessonTitle} | ${course?.title || 'Course'}`,
      description: `Lesson: ${lessonTitle} in ${course?.title || 'course'}`,
      alternates: { canonical: `${baseUrl}/courses/${slug}/${lessonSlug}` },
    };
  } catch {
    return {
      title: `Lesson | ${slug}`,
      description: `Lesson page for course ${slug}`,
      alternates: { canonical: `${baseUrl}/courses/${slug}/${lessonSlug}` },
    };
  }
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await params;
  let course: any = null;
  let lesson: any = null;
  let module: any = null;
  try {
    const db = await getDatabase();
    course = await db.collection('courses').findOne({ slug });
    if (course) {
      const units = course.units || course.modules || [];
      for (const unit of units) {
        const chapters = unit.chapters || [{ id: unit.id, title: unit.title, lessons: unit.lessons || [] }];
        for (const chapter of chapters) {
          const l = (chapter.lessons || []).find((l: any) => l.slug === lessonSlug);
          if (l) {
            lesson = l;
            module = chapter; // Use chapter as the immediate parent
            break;
          }
        }
        if (lesson) break;
      }
    }
  } catch { }

  // 1. Authentication Check
  const { userId } = await auth();
  if (!userId) {
    // TODO: Redirect to sign-in with callback
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <p>You need to be logged in to view this lesson.</p>
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(`/courses/${slug}/${lessonSlug}`)}`}>
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Enrollment Check
  let isAuthorized = false;
  if (course && course._id) {
    const db = await getDatabase();
    // Check if author
    if (course.authorId === userId) {
      isAuthorized = true;
    } else {
      // Check enrollment
      const enrollment = await db.collection('enrollments').findOne({
        userId,
        $or: [
          { courseId: course._id.toString() },
          { courseId: course.slug }
        ],
        status: 'approved'
      });

      // Check completion (legacy support or alternative access)
      const completion = await db.collection('courseCompletions').findOne({
        userId,
        $or: [
          { courseId: course._id.toString() },
          { courseId: course.slug }
        ]
      });

      if (enrollment || completion) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Enrollment Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              You must be enrolled in <strong>{course?.title || 'this course'}</strong> to access this lesson.
            </p>
            <Link href={`/courses/${slug}`}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
                Go to Enrollment Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <BreadcrumbsJsonLd items={[
        { name: 'Courses', url: `${baseUrl}/courses` },
        { name: course.title, url: `${baseUrl}/courses/${slug}` },
        { name: lesson.title, url: `${baseUrl}/courses/${slug}/${lessonSlug}` },
      ]} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link href="/courses" className="hover:underline">Courses</Link> / <Link href={`/courses/${slug}`} className="hover:underline">{course.title}</Link> / <span className="text-gray-900 dark:text-white">{lesson.title}</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-widest text-[10px]">
                {lesson.contentType || 'text'}
              </span>
              <span>•</span>
              <span>Part of {module.title}</span>
            </div>
          </div>

          {/* Live Session (Jitsi) */}
          {lesson.contentType === 'live' && lesson.liveRoomId && (
            <Card className="mb-8 overflow-hidden border-2 border-rose-500 shadow-xl shadow-rose-500/10">
              <CardHeader className="bg-rose-500 text-white py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE BROADCAST STUDIO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-video bg-black">
                <iframe
                  src={`https://meet.jit.si/${lesson.liveRoomId}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedmetoken","raisehand","fmf","videoquality","filmstrip","invite","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write; self-view-display"
                  className="w-full h-full border-none"
                />
              </CardContent>
            </Card>
          )}

          {/* Video Player (Masterclass) */}
          {(lesson.contentType === 'video' || lesson.videoUrl || lesson.videoId) && (
            <Card className="mb-8 overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <LessonVideoPlayer
                  videoUrl={lesson.videoUrl}
                  videoId={lesson.videoId}
                  title={lesson.title}
                  provider={lesson.videoProvider || (lesson.videoUrl?.includes('m3u8') ? 'hls' : 'youtube')}
                  courseSlug={slug}
                  lessonSlug={lessonSlug}
                />
              </CardContent>
            </Card>
          )}

          {/* Lesson Content (Document/Text) */}
          {lesson.content && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Lesson Material
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-lg">
                    {lesson.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Quiz (Adaptive) */}
          {(lesson.contentType === 'quiz' || !lesson.contentType) && (
            <Card className="mb-8 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                  Knowledge Check
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AdaptiveQuiz topic={lesson.title} initialDifficulty="medium" />
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {lesson.resources.map((r: any, i: number) => (
                    <li key={i} className="flex items-center gap-3 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {r.type === 'pdf' ? '📄' : r.type === 'video' ? '🎥' : '🔗'}
                      </span>
                      <a href={r.url} target="_blank" rel="noopener" className="flex-1 text-blue-600 dark:text-blue-400 hover:underline">
                        <div className="font-bold text-sm tracking-tight">{r.title || 'Download Resource'}</div>
                        {r.type && <div className="text-[10px] text-gray-400 font-black uppercase">{r.type}</div>}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <Link href={`/courses/${slug}`}>
              <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                ← Back to Curriculum
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="px-8">Previous</Button>
              <Button size="lg" className="px-10 bg-teal-600 hover:bg-teal-700">Next Lesson →</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

