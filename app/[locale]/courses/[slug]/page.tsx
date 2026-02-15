import { getDatabase } from '@/lib/mongodb';
import { CourseServiceNeon } from '@/lib/course-service-neon';
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
import { EnrollButton } from '@/components/courses/EnrollButton';
import { auth } from '@/lib/auth';
import type { WithId } from 'mongodb';
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd';
import { SocialShare } from '@/components/ui/SocialShare';
import { BRAND_URL } from '@/lib/brand';

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';

  try {
    const db = await getDatabase();
    let course = await db.collection('courses').findOne(
      { slug },
      { projection: { title: 1, summary: 1 } }
    );

    // If not in Mongo, check Neon
    if (!course) {
      const neonCourse = await CourseServiceNeon.getCourseBySlug(slug);
      if (neonCourse) {
        course = neonCourse as any;
      }
    }

    if (!course) {
      return {
        title: 'Course not found',
        description: 'We could not find the course you were looking for.',
        alternates: { canonical: `${baseUrl}/courses/${slug}` },
      };
    }

    const title = course.title || 'Course details';
    const description = course.summary || ('An adaptive course by ' + (await import('@/lib/brand')).BRAND_NAME);

    return {
      title,
      description,
      alternates: { canonical: `${baseUrl}/courses/${slug}` },
      openGraph: {
        title,
        description,
        url: `${baseUrl}/courses/${slug}`,
        type: 'website',
      }
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
    course = await db.collection('courses').findOne({ slug }) as any;

    if (!course) {
      const neonCourse = await CourseServiceNeon.getCourseBySlug(slug);
      if (neonCourse) {
        course = {
          ...neonCourse,
          _id: (neonCourse as any).id,
          units: (neonCourse as any).curriculum || [],
          modules: (neonCourse as any).curriculum || [] // for components still using .modules
        } as any;
      }
    }


    if (course && userId) {
      const courseId = String(course._id);
      const enrollmentRecord = await db.collection('enrollments').findOne({
        userId,
        $or: [
          { courseId: courseId },
          { courseId: course.slug }
        ]
      });
      if (enrollmentRecord) {
        enrollmentStatus = enrollmentRecord.status || null;
      }

      // Check enrollment and completion
      const completion = await db.collection('courseCompletions').findOne({
        userId,
        $or: [
          { courseId: courseId },
          { courseId: course.slug }
        ]
      });
      isCompleted = !!completion;
      completionCertificateId = completion?.certificateId || null;
      const hasProgress = (await db.collection('userProgress').countDocuments({ userId, courseId })) > 0;
      const isApproved = enrollmentRecord?.status === 'approved';
      isEnrolled = isCompleted || isApproved || hasProgress;

      // Fetch reviews directly from DB to avoid self-fetch overhead
      const APPROVED_QUERY = {
        $or: [{ status: 'approved' }, { status: { $exists: false } }],
      };
      const reviewsCollection = db.collection('reviews');
      const reviewsList = await reviewsCollection
        .find({ courseSlug: slug, ...APPROVED_QUERY })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      const statsAgg = await reviewsCollection
        .aggregate([
          { $match: { courseSlug: slug, ...APPROVED_QUERY } },
          {
            $group: {
              _id: '$courseSlug',
              total: { $sum: 1 },
              sum: { $sum: '$rating' },
            },
          },
        ])
        .toArray();

      const statsRecord = statsAgg[0] || { total: 0, sum: 0 };
      reviews = {
        reviews: serializeDocument(reviewsList.map(r => ({ ...r, userName: r.userName || 'Learner' }))),
        stats: {
          total: statsRecord.total,
          sum: statsRecord.sum,
          average: statsRecord.total > 0 ? (statsRecord.sum / statsRecord.total).toFixed(1) : '0',
        }
      };

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';

  // Support both legacy modules and new units
  const units = courseData.units || courseData.modules || [];
  const totalLessons = units.reduce((acc: number, unit: any) => {
    const chapters = unit.chapters || [{ lessons: unit.lessons || [] }];
    return acc + chapters.reduce((cAcc: number, chapter: any) => cAcc + (chapter.lessons?.length || 0), 0);
  }, 0);

  const completedCount = userProgress.completedLessons?.size || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.title,
    description: courseData.summary || 'An adaptive course by Refectl',
    provider: {
      '@type': 'Organization',
      name: 'Refectl',
      sameAs: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.svg`
      }
    },
    educationalLevel: courseData.level || 'Intermediate',
    author: {
      '@type': 'Organization',
      name: 'Refectl Editorial'
    },
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
      <BreadcrumbsJsonLd items={[
        { name: 'Courses', url: `${baseUrl}/courses` },
        { name: courseData.title, url: `${baseUrl}/courses/${courseData.slug}` },
      ]} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 md:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0,transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-col gap-6">
              {/* Breadcrumbs / Back navigation */}
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 animate-in fade-in slide-in-from-left duration-700">
                <Link href="/courses" className="hover:text-blue-400 transition-colors">Courses</Link>
                <span className="text-white/20">/</span>
                <span className="text-white/60 truncate max-w-[200px]">{courseData.subject || 'General'}</span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight animate-in fade-in slide-in-from-top duration-700 delay-100">
                    {courseData.title}
                  </h1>
                  <div className="flex-shrink-0 animate-in fade-in zoom-in duration-700 delay-300">
                    <SocialShare
                      url={`${BRAND_URL}/courses/${slug}`}
                      title={courseData.title}
                      contentType="course"
                      contentId={String(courseData._id)}
                    />
                  </div>
                </div>

                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                  {courseData.summary || 'Master this subject with our adaptive learning platform'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
                {reviews?.stats?.average && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                    <span className="text-amber-400 text-lg">★</span>
                    <span className="font-black text-lg tracking-tight">{reviews.stats.average}</span>
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest ml-1">
                      ({reviews.stats.total} Reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                  <span className="text-blue-400 text-lg">📚</span>
                  <span className="font-black text-lg tracking-tight">{totalLessons}</span>
                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest ml-1">Lessons</span>
                </div>

                {courseData.level && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl capitalize">
                    <span className="text-purple-400 text-lg">⚡</span>
                    <span className="font-black text-lg tracking-tight">{courseData.level}</span>
                    <span className="text-xs text-white/40 font-bold uppercase tracking-widest ml-1">Intensity</span>
                  </div>
                )}

                {courseData.subject && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md shadow-xl text-blue-400">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{courseData.subject}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Celebration Banner */}
          {isCompleted && (
            <div className="lg:col-span-3 animate-in fade-in zoom-in duration-700">
              <Card className="border-none shadow-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] opacity-50 transition-opacity group-hover:opacity-80" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />

                <CardContent className="p-8 relative z-10 flex items-center justify-between flex-wrap gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                        Achievement Unlocked
                      </span>
                    </div>
                    <div className="text-4xl font-black tracking-tight">Mastery Attained 🎉</div>
                    <div className="text-white/80 text-lg font-medium max-w-xl">
                      Exceptional work! You've successfully conquered <span className="text-white font-black underline decoration-white/30 decoration-2 underline-offset-4">{courseData.title}</span>.
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {completionCertificateId && (
                      <Link href={`/certificates/${completionCertificateId}`}>
                        <Button className="px-8 py-6 bg-white text-emerald-700 hover:bg-emerald-50 font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all">
                          Claim Certificate
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Preview (for non-enrolled users) */}
            {!isEnrolled && (
              <div id="enrollment-section">
                <CoursePreview
                  course={courseData}
                  isAuthenticated={Boolean(userId)}
                  initialEnrollmentStatus={initialEnrollmentStatus}
                />
              </div>
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
                    units={units}
                    slug={slug}
                    userId={userId}
                    completedLessonIds={Array.from(userProgress.completedLessons || [])}
                    isEnrolled={isEnrolled}
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
            <Card className="sticky top-24 border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden rounded-[2.5rem] border border-white/10">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                      <span className="text-8xl relative z-10 filter drop-shadow-2xl brightness-110 group-hover:scale-110 transition-transform duration-700">📚</span>
                    </div>
                  </div>

                  {/* Floating Metadata Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                      Refectl Elite
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                      Curriculum Highlights
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { label: `Master ${courseData.subject || 'the subject'}`, icon: '🎯' },
                        { label: `${totalLessons} Elite Lessons`, icon: '💎' },
                        { label: 'Adaptive Assessments', icon: '🧠' },
                        { label: 'Certified Credential', icon: '📜' }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 group/item">
                          <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-sm group-hover/item:scale-110 transition-transform">{item.icon}</span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Subject</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{courseData.subject || 'General'}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Intensity</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate capitalize">{courseData.level || 'Adaptive'}</div>
                      </div>
                    </div>
                  </div>
                  {!isEnrolled ? (
                    <EnrollButton
                      courseId={String(courseData._id)}
                      slug={slug}
                      price={typeof courseData.price === 'number' ? courseData.price : (courseData.price?.amount || 0)}
                      currency={courseData.currency || courseData.price?.currency}
                      userId={userId}
                      isEnrolled={isEnrolled}
                    />
                  ) : (
                    <Link href={`/courses/${slug}/${units[0]?.chapters?.[0]?.lessons?.[0]?.slug || units[0]?.lessons?.[0]?.slug || ''}`}>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 font-bold" size="lg">
                        {isCompleted ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </Link>
                  )}
                  {isEnrolled && (
                    <Link href="/my-learning" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View My Learning
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
