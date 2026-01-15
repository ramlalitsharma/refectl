import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { CourseLibrary } from '@/components/courses/CourseLibrary';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { auth } from '@/lib/auth';
import { getUserRole } from '@/lib/admin-check';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';

export const dynamic = 'force-dynamic';

const sanitizeCourse = (course: any) => ({
  _id: String(course._id ?? course.slug),
  slug: String(course.slug ?? course._id),
  title: course.title,
  summary: course.summary,
  subject: course.subject,
  level: course.level,
  type: course.type, // Include type field for filtering
  modules: course.modules,
  createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : course.createdAt,
  icon: course.metadata?.icon || '📘',
  price: course.price,
  thumbnail: course.thumbnail,
  tags: Array.isArray(course.tags) ? course.tags : [],
});

export default async function CoursesIndexPage({ searchParams }: { searchParams: Promise<{ category?: string; type?: string }> }) {
  const { userId } = await auth();
  const role = await getUserRole();
  const canCreate = ['superadmin', 'admin', 'teacher'].includes(role || '');
  const params = await searchParams;
  const selectedType = params?.type; // 'video', 'text', or undefined for all

  let rawCourses: any[] = [];
  let rawSubjects: any[] = [];
  let totalCourses = 0;
  let publishedCourses = 0;
  let db: any = null;

  try {
    db = await getDatabase();

    // Build query based on type parameter
    const query: any = { status: 'published' };

    if (selectedType === 'video') {
      query.type = 'video-course';
    } else if (selectedType === 'text') {
      // Treat text courses as the default/legacy type (including null/undefined)
      // Exclude only explicitly valid alternative types
      query.type = { $nin: ['video-course', 'live-course'] };
    } else {
      // Default view (All): exclude special types if we want 'All' to mean 'All' 
      // OR if 'All' should just be everything, we don't need a filter.
      // Assuming 'All' means 'Everything', we remove the filter. 
      // BUT if 'All' currently excludes live/video, we keep it consistent.
      // Based on previous code, 'All' excluded live/video. Let's keep that for now to match 'Text'
      // UNLESS 'All' is meant to show EVERYTHING. 
      // Let's make 'All' show everything, or at least consistent with 'Text'.
      // PROPOSAL: Make 'text' filter aggressive (legacy) and 'all' filter permissive (everything).
      // However, to fix the specific bug "type=text" shows nothing:
      query.type = { $nin: ['video-course', 'live-course'] };
    }

    rawCourses = await db
      .collection('courses')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    rawSubjects = await db
      .collection('subjects')
      .find({})
      .toArray();
    totalCourses = await db.collection('courses').countDocuments({});
    publishedCourses = await db.collection('courses').countDocuments({ status: 'published' });
  } catch (error) {
    console.error('Courses fetch error:', error);
    rawCourses = [];
    rawSubjects = [];
  }

  const courses = rawCourses.map(sanitizeCourse);
  const subjects = rawSubjects.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    slug: s.slug || String(s._id),
    category: s.category || 'General',
  }));

  // Create category mapping from subjects
  const subjectCategoryBySlug = new Map<string, string>();
  const subjectCategoryByName = new Map<string, string>();
  subjects.forEach((subject) => {
    if (subject.slug) subjectCategoryBySlug.set(subject.slug.toLowerCase(), subject.category);
    if (subject.name) subjectCategoryByName.set(subject.name.toLowerCase(), subject.category);
  });

  // Group courses by category
  const categoryBuckets = new Map<string, typeof courses>();
  courses.forEach((course) => {
    const subjectKey = course.subject ? course.subject.toLowerCase() : '';
    const category =
      subjectCategoryBySlug.get(subjectKey) ||
      subjectCategoryByName.get(subjectKey) ||
      'General';

    if (!categoryBuckets.has(category)) {
      categoryBuckets.set(category, []);
    }
    categoryBuckets.get(category)!.push(course);
  });

  // Get all categories with counts
  const categories = Array.from(new Set(subjects.map((s) => s.category).filter(Boolean)));
  if (categoryBuckets.has('General')) {
    categories.push('General');
  }
  const uniqueCategories = Array.from(new Set(categories));

  const categoryList = uniqueCategories.map((cat) => ({
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
    count: categoryBuckets.get(cat)?.length || 0,
  }));


  // Database already filtered by type parameter, no need for client-side re-filtering
  // The query.type filter (lines 48-54) handles video/text course filtering correctly

  // Filter courses by selected category
  const selectedCategory = params?.category;
  const filteredCourses = selectedCategory
    ? courses.filter(c => {
      const subjectKey = c.subject ? c.subject.toLowerCase() : '';
      const category = subjectCategoryBySlug.get(subjectKey) || subjectCategoryByName.get(subjectKey) || 'General';
      return category === selectedCategory;
    })
    : courses;

  const totalLessons = courses.reduce((sum, course) => {
    return (
      sum +
      (course.modules?.reduce((count: number, module: any) => count + (module.lessons?.length || 0), 0) || 0)
    );
  }, 0);

  let enrollmentStatuses: Record<string, string> = {};
  if (userId && db) {
    try {
      const courseIds = courses
        .map((course) => course._id || course.slug)
        .filter(Boolean);

      if (courseIds.length) {
        const enrollments = await db
          .collection('enrollments')
          .find({ userId, courseId: { $in: courseIds } })
          .toArray();

        const completions = await db
          .collection('courseCompletions')
          .find({ userId, courseId: { $in: courseIds } })
          .toArray();

        const completedIds = new Set<string>(
          completions.map((item: any) => String(item.courseId))
        );

        enrollmentStatuses = enrollments.reduce((acc: Record<string, string>, record: any) => {
          const key = record.courseId;
          if (completedIds.has(key)) {
            acc[key] = 'completed';
          } else {
            acc[key] = record.status;
          }
          return acc;
        }, {});

        completedIds.forEach((courseId: string) => {
          if (!enrollmentStatuses[courseId]) {
            enrollmentStatuses[courseId] = 'completed';
          }
        });
      }
    } catch (error) {
      console.error('Enrollment status fetch error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-dot-grid">
      <div className="container mx-auto px-4 py-12 space-y-12 relative overflow-visible">
        {/* Animated Background Blob */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-500/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-40 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

        <FadeIn delay={0.1}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Courses' }]} className="mb-6 opacity-60 hover:opacity-100 transition-opacity" />
        </FadeIn>

        <section className="relative rounded-[40px] overflow-hidden border border-white/40 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] noise-texture bg-mesh">
          <CardContent className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)] items-center p-8 md:p-14 relative z-10">
            <div className="space-y-8">
              <FadeIn delay={0.2}>
                <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  Refintl Course Library
                </span>
              </FadeIn>

              <FadeIn delay={0.3}>
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  {selectedType === 'video' ? (
                    <>Master Skills with <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Video Classes</span></>
                  ) : selectedType === 'text' ? (
                    <>Learn Through <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Text Classes</span></>
                  ) : selectedCategory ? (
                    <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                      {selectedCategory}
                    </span>
                  ) : (
                    <>Shape Your <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Future</span> With Expert Knowledge.</>
                  )}
                </h1>
              </FadeIn>

              <FadeIn delay={0.4}>
                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                  {selectedType === 'video'
                    ? `Explore our curated collection of ${filteredCourses.length} video courses with expert instructors and interactive content.`
                    : selectedType === 'text'
                      ? `Browse ${filteredCourses.length} comprehensive text-based courses designed for deep learning and self-paced study.`
                      : selectedCategory
                        ? `Explore our high-fidelity collection of ${filteredCourses.length} ${selectedCategory.toLowerCase()} courses, meticulously crafted for deep learning and mastery.`
                        : 'Access world-class learning paths designed by industry experts. Every course is optimized for rapid skill acquisition and career acceleration.'}
                </p>
              </FadeIn>

              <FadeIn delay={0.5} className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-2xl px-8 h-14 font-black shadow-xl shadow-teal-500/20 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200" asChild>
                  <Link href="/my-learning">Continue Learning</Link>
                </Button>
                {canCreate && (
                  <Button variant="outline" size="lg" className="rounded-2xl border-slate-200 dark:border-slate-800 px-8 h-14 font-black hover:bg-slate-100 dark:hover:bg-slate-900" asChild>
                    <Link href="/admin/studio">AI Studio</Link>
                  </Button>
                )}
              </FadeIn>
            </div>

            <div className="grid w-full gap-4 grid-cols-2">
              <StatCard label="Live Courses" value={totalCourses} icon="💎" delay={0.6} />
              <StatCard label="Active Now" value={publishedCourses} icon="⚡" delay={0.7} />
              <StatCard label="Disciplines" value={uniqueCategories.length} icon="🎯" delay={0.8} />
              <StatCard label="Modules" value={totalLessons} icon="🧩" delay={0.9} />
            </div>
          </CardContent>
        </section>

        <FadeIn delay={1.0}>
          <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/20 dark:border-white/5">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Intelligence Filtering</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                  Select a category to narrow your journey. Our system prioritizes high-engagement content for your specific professional goals.
                </p>
              </div>
              <CategoryNavigation
                categories={categoryList}
                currentCategory={selectedCategory}
                basePath="/courses"
              />
            </CardContent>
          </Card>
        </FadeIn>

        {selectedCategory && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{selectedCategory} Courses</h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm">View All Categories</Button>
            </Link>
          </div>
        )}

        <CourseLibrary
          courses={filteredCourses}
          initialEnrollmentStatuses={enrollmentStatuses}
          isAuthenticated={Boolean(userId)}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, delay }: { label: string; value: number; icon: string; delay: number }) {
  return (
    <ScaleIn delay={delay}>
      <div className="group relative rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xl">{icon}</span>
            <div className="h-1 w-1 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {value.toLocaleString()}
          </div>
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">
            {label}
          </div>
        </div>
      </div>
    </ScaleIn>
  );
}


