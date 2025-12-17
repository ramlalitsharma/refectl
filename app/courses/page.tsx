import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { CourseLibrary } from '@/components/courses/CourseLibrary';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const sanitizeCourse = (course: any) => ({
  _id: String(course._id ?? course.slug),
  slug: String(course.slug ?? course._id),
  title: course.title,
  summary: course.summary,
  subject: course.subject,
  level: course.level,
  modules: course.modules,
  createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : course.createdAt,
  icon: course.metadata?.icon || '📘',
  price: course.price,
  thumbnail: course.thumbnail,
  tags: Array.isArray(course.tags) ? course.tags : [],
});

export default async function CoursesIndexPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { userId } = await auth();
  const params = await searchParams;
  let rawCourses: any[] = [];
  let rawSubjects: any[] = [];
  let totalCourses = 0;
  let publishedCourses = 0;
  let db: any = null;

  try {
    db = await getDatabase();
    rawCourses = await db
      .collection('courses')
      .find({ status: 'published' })
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

  // Filter courses by selected category
  const selectedCategory = params?.category;
  const filteredCourses = selectedCategory
    ? categoryBuckets.get(selectedCategory) || []
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
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Courses' }]} className="mb-4" />

        <Card className="border-none shadow-2xl bg-gradient-to-br from-teal-600 via-emerald-500 to-indigo-500 text-white">
          <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,0.8fr)] items-center p-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                <span>📚</span> Course Library
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                {selectedCategory ? `${selectedCategory} Courses` : 'Discover curated courses tailored to your learning journey.'}
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                {selectedCategory
                  ? `Explore ${filteredCourses.length} ${selectedCategory.toLowerCase()} courses designed by industry experts.`
                  : 'Search, filter, and bookmark high-impact learning paths designed by industry experts. Every course adapts to your pace with AI-personalized recommendations.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="inverse" className="px-6" asChild>
                  <Link href="/my-learning">Continue Learning</Link>
                </Button>
                <Button variant="outline" className="border-white text-white px-6" asChild>
                  <Link href="/admin/studio">Create With AI Studio</Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Stat label="Available Courses" value={totalCourses} description="Total courses" />
              <Stat label="Published Courses" value={publishedCourses} description="Published courses" />
              <Stat label="Categories" value={uniqueCategories.length} description="Learning areas" />
              <Stat label="Lessons Included" value={totalLessons} description="Interactive modules" />
              <Stat label="New This Month" value={courses.filter((c) => c.createdAt).length} description="Fresh releases" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
              <p className="text-sm text-slate-500">
                Filter courses by category to find exactly what you're looking for. Each category contains curated courses tailored to specific learning goals.
              </p>
            </div>
            <CategoryNavigation
              categories={categoryList}
              currentCategory={selectedCategory}
              basePath="/courses"
            />
          </CardContent>
        </Card>

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

function Stat({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-wide text-white/70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/60">{description}</div>
    </div>
  );
}


