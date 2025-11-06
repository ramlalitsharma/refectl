import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { CourseReviews } from '@/components/courses/CourseReviews';
import { CoursePreview } from '@/components/courses/CoursePreview';
import { CourseCompletion } from '@/components/courses/CourseCompletion';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();
  
  let course: any = null;
  let reviews: any = null;
  let userProgress: any = {};
  let isEnrolled = false;
  let isCompleted = false;
  
  try {
    const db = await getDatabase();
    course = await db.collection('courses').findOne({ slug });
    
    if (course && userId) {
      // Check enrollment and completion
      const enrollment = await db.collection('courseCompletions').findOne({ userId, courseId: String(course._id) });
      isCompleted = !!enrollment;
      isEnrolled = isCompleted || (await db.collection('userProgress').countDocuments({ userId, courseId: String(course._id) })) > 0;
      
      // Fetch reviews
      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/courses/${slug}/reviews`, { cache: 'no-store' });
      reviews = reviewsRes.ok ? await reviewsRes.json() : { reviews: [], stats: { average: '0', total: 0 } };
      
      // Fetch user progress
      const progress = await db.collection('userProgress').find({ userId, courseId: String(course._id) }).toArray();
      const completedLessons = new Set(progress.map((p: any) => p.lessonId).filter(Boolean));
      userProgress = { completedLessons };
    }
  } catch {}

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com';
  const canonical = `${baseUrl}/courses/${course.slug}`;
  const totalLessons = (course.modules || []).reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0);
  const completedCount = userProgress.completedLessons?.size || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary || 'An adaptive course by AdaptIQ',
    provider: { '@type': 'Organization', name: 'AdaptIQ', sameAs: baseUrl },
    aggregateRating: reviews?.stats?.average ? {
      '@type': 'AggregateRating',
      ratingValue: reviews.stats.average,
      reviewCount: reviews.stats.total,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <head>
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl opacity-90 mb-4">{course.summary || 'Master this subject with our adaptive learning platform'}</p>
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
              {course.level && (
                <>
                  <span>•</span>
                  <span className="capitalize">{course.level}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Preview (for non-enrolled users) */}
            {!isEnrolled && <CoursePreview course={course} />}

            {/* Course Completion (for enrolled users) */}
            {isEnrolled && !isCompleted && progressPercent >= 90 && (
              <CourseCompletion courseSlug={slug} courseTitle={course.title} />
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
                  {(course.modules || []).map((module: any, midx: number) => {
                    const moduleLessons = module.lessons || [];
                    const completedInModule = moduleLessons.filter((l: any) => 
                      userProgress.completedLessons?.has(l.id)
                    ).length;
                    const moduleProgress = moduleLessons.length > 0 
                      ? Math.round((completedInModule / moduleLessons.length) * 100) 
                      : 0;

                    return (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">{module.title}</h3>
                          {userId && moduleLessons.length > 0 && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {completedInModule}/{moduleLessons.length} completed
                            </span>
                          )}
                        </div>
                        {userId && moduleLessons.length > 0 && (
                          <Progress value={moduleProgress} color="blue" className="mb-4" />
                        )}
                        <ol className="space-y-2">
                          {moduleLessons.map((lesson: any, lidx: number) => {
                            const isCompleted = userProgress.completedLessons?.has(lesson.id);
                            return (
                              <li key={lesson.id} className="flex items-start gap-3">
                                <div className="mt-1">
                                  {isCompleted ? (
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                  ) : (
                                    <span className="text-gray-400">{lidx + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Link 
                                    href={`/courses/${slug}/${lesson.slug}`}
                                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    {lesson.title}
                                  </Link>
                                  {lesson.content && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {lesson.content.slice(0, 120)}...
                                    </p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    );
                  })}
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
                      <li>• Master {course.subject || 'the subject'}</li>
                      <li>• {totalLessons} comprehensive lessons</li>
                      <li>• Adaptive quizzes and assessments</li>
                      <li>• Certificate of completion</li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                        <span className="font-medium">{course.subject || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Level:</span>
                        <span className="font-medium capitalize">{course.level || 'All'}</span>
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
