import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { CourseReviews } from '@/components/courses/CourseReviews';
import { CoursePreview } from '@/components/courses/CoursePreview';
import { CourseCompletion } from '@/components/courses/CourseCompletion';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { CourseContentAccordion } from '@/components/courses/CourseContentAccordion';
import { auth } from '@/lib/auth';
import type { WithId } from 'mongodb';

function serializeDocument<T = any>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }

  if (typeof value === 'object') {
    const objectValue = value as { [key: string]: any };

    if ('_bsontype' in objectValue && typeof objectValue._bsontype === 'string') {
      const bsonType = objectValue._bsontype.toLowerCase();
      if (bsonType === 'objectid' && typeof objectValue.toHexString === 'function') {
        return objectValue.toHexString() as unknown as T;
      }
      if (bsonType === 'decimal128' && typeof objectValue.toString === 'function') {
        return objectValue.toString() as unknown as T;
      }
    }

    if (Array.isArray(value)) {
      return (value as unknown as any[]).map((item) => serializeDocument(item)) as unknown as T;
    }

    const plain: Record<string, any> = {};
    for (const [key, val] of Object.entries(objectValue)) {
      plain[key] = serializeDocument(val);
    }
    return plain as unknown as T;
  }

  return value;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';

  try {
    const db = await getDatabase();
    const course = await db.collection('courses').findOne(
      { slug },
      { projection: { title: 1, summary: 1 } }
    );

    if (!course) {
      return {
        title: 'Course not found',
        description: 'We could not find the course you were looking for.',
        alternates: { canonical: `${baseUrl}/courses/${slug}` },
      };
    }

    const courseData = serializeDocument(course);

    return {
      title: courseData.title || 'Course details',
      description: courseData.summary || 'An adaptive course by AdaptIQ',
      alternates: { canonical: `${baseUrl}/courses/${slug}` },
    };
  } catch {
    return {
      title: 'Course details',
      description: 'Explore detailed information about this course.',
      alternates: { canonical: `${baseUrl}/courses/${slug}` },
    };
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();

  let course: WithId<any> | null = null;
  let reviews: any = null;
  let userProgress: any = {};
  let isEnrolled = false;
  let isCompleted = false;
  let completionCertificateId: string | null = null;
  let enrollmentStatus: string | null = null;

  try {
    const db = await getDatabase();
    course = await db.collection('courses').findOne({ slug });

    if (course && userId) {
      const courseId = String(course._id);
      const enrollmentRecord = await db.collection('enrollments').findOne({ userId, courseId });
      if (enrollmentRecord) {
        enrollmentStatus = enrollmentRecord.status || null;
      }

      // Check enrollment and completion
      const completion = await db.collection('courseCompletions').findOne({ userId, courseId });
      isCompleted = !!completion;
      completionCertificateId = completion?.certificateId || null;
      const hasProgress = (await db.collection('userProgress').countDocuments({ userId, courseId })) > 0;
      const isApproved = enrollmentRecord?.status === 'approved';
      isEnrolled = isCompleted || isApproved || hasProgress;

      // Fetch reviews
      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/courses/${slug}/reviews`, { cache: 'no-store' });
      reviews = reviewsRes.ok ? await reviewsRes.json() : { reviews: [], stats: { average: '0', total: 0 } };

      // Fetch user progress
      const progress = await db.collection('userProgress').find({ userId, courseId }).toArray();
      const completedLessons = new Set(progress.map((p: any) => p.lessonId).filter(Boolean));
      userProgress = { completedLessons };
    }
  } catch { }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course not found</h1>
          <Link href="/courses" className="text-blue-600 hover:underline">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const courseData = serializeDocument(course);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';
  const totalLessons = (courseData.modules || []).reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0);
  const completedCount = userProgress.completedLessons?.size || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.title,
    description: courseData.summary || 'An adaptive course by AdaptIQ',
    provider: { '@type': 'Organization', name: 'AdaptIQ', sameAs: baseUrl },
    aggregateRating: reviews?.stats?.average ? {
      '@type': 'AggregateRating',
      ratingValue: reviews.stats.average,
      reviewCount: reviews.stats.total,
    } : undefined,
  };

  const initialEnrollmentStatus = (enrollmentStatus && ['pending', 'approved', 'waitlisted', 'rejected'].includes(enrollmentStatus)
    ? (enrollmentStatus as 'pending' | 'approved' | 'waitlisted' | 'rejected')
    : undefined);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Script
        id={`course-jsonld-${courseData.slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/courses">
              <Button variant="outline" size="sm">← Back</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-xl opacity-90 mb-4">{courseData.summary || 'Master this subject with our adaptive learning platform'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {reviews?.stats?.average && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold">{reviews.stats.average}</span>
                  <span className="opacity-80">({reviews.stats.total} reviews)</span>
                </div>
              )}
              <span>•</span>
              <span>{totalLessons} lessons</span>
              {courseData.level && (
                <>
                  <span>•</span>
                  <span className="capitalize">{courseData.level}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Celebration Banner */}
          {isCompleted && (
            <div className="lg:col-span-3">
              <Card className="border-none shadow-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="text-sm uppercase tracking-wide text-white/80">Achievement Unlocked</div>
                    <div className="text-2xl font-semibold">Course Completed 🎉</div>
                    <div className="text-white/80 text-sm">Great work finishing {courseData.title}. Your certificate is ready.</div>
                  </div>
                  {completionCertificateId && (
                    <Link href={`/certificates/${completionCertificateId}`}>
                      <Button variant="inverse" className="px-6">View Certificate</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Preview (for non-enrolled users) */}
            {!isEnrolled && (
              <CoursePreview
                course={courseData}
                isAuthenticated={Boolean(userId)}
                initialEnrollmentStatus={initialEnrollmentStatus}
              />
            )}

            {/* Course Completion (for enrolled users) */}
            {isEnrolled && !isCompleted && progressPercent >= 90 && (
              <CourseCompletion courseSlug={slug} courseTitle={courseData.title} />
            )}

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                {userId && progressPercent > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Your Progress</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} color="green" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CourseContentAccordion
                    modules={courseData.modules || []}
                    slug={slug}
                    userId={userId}
                    completedLessonIds={Array.from(userProgress.completedLessons || [])}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {reviews && <CourseReviews courseSlug={slug} initialReviews={reviews} />}

            {/* Course Recommendations */}
            {userId && <CourseRecommendations />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl text-white opacity-90">📚</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What you'll learn</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Master {courseData.subject || 'the subject'}</li>
                      <li>• {totalLessons} comprehensive lessons</li>
                      <li>• Adaptive quizzes and assessments</li>
                      <li>• Certificate of completion</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                        <span className="font-medium">{courseData.subject || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Level:</span>
                        <span className="font-medium capitalize">{courseData.level || 'All'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Lessons:</span>
                        <span className="font-medium">{totalLessons}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    {userId ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                  <Link href="/my-learning" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View My Learning
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
