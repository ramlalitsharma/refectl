import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { CourseSlider } from '@/components/courses/CourseSlider';
import { CategorySearch } from '@/components/search/CategorySearch';

export const dynamic = 'force-dynamic';

interface Course {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  price?: { amount?: number; currency?: string } | number;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string;
}

const NEW_THRESHOLD_DAYS = 7;
const NEW_THRESHOLD_MS = NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

const formatPrice = (price?: { amount?: number; currency?: string } | number) => {
  if (price === undefined || price === null) return 'Free';
  if (typeof price === 'number') {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  }
  const amount = price.amount ?? 0;
  if (amount === 0) return 'Free';
  const currency = price.currency || 'USD';
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
};

const contactInfo = [
  { icon: '✉️', label: 'Email', value: 'support@adaptiq.com' },
  { icon: '☎️', label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: '📍', label: 'Location', value: '88 Innovation Drive, San Francisco, CA' },
];

const getCategoryDisplayName = (category: string) => {
  const displayNames: Record<string, string> = {
    'General': 'Programming',
    'general': 'Programming',
    'academic': 'Academic',
    'professional': 'Professional',
    'language': 'Language',
    'test-prep': 'Test Prep',
    'iq-cognitive': 'IQ & Cognitive',
  };
  return displayNames[category] || category;
};

const getCategoryDescription = (category: string) =>
  `Curated experiences for ${category.toLowerCase()} learners. Explore personalized pathways and resources tailored to this focus area.`;

const getBadges = (tags: string[] = [], createdAt?: string) => {
  const badges: string[] = [];
  if (tags.some((tag) => tag.toLowerCase() === 'trending')) badges.push('Trending');
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created) && Date.now() - created < NEW_THRESHOLD_MS) {
      badges.push('New');
    }
  }
  return badges;
};

export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ - Grow Your Skills, Build Your Future',
    description:
      'Discover trending courses, live classes, and online batches on AdaptIQ. Start learning with AI-powered personalization today.',
    keywords: kws.length ? kws : undefined,
  };
}

export default async function Home() {
  const db = await getDatabase();
  const { userId } = await auth();

  const [rawCourses, rawBlogs, rawSubjects, rawExams, rawPractice] = await Promise.all([
    db
      .collection('courses')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()
      .catch(() => []),
    db
      .collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('subjects')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('examTemplates')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('practiceSets')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
  ]);

  const safeDate = (value: any) => (value instanceof Date ? value.toISOString() : value);

  const courses: Course[] = (rawCourses as any[]).map((course) => ({
    id: String(course._id),
    slug: course.slug || String(course._id),
    title: course.title,
    summary: course.summary,
    subject: course.subject,
    level: course.level,
    price: typeof course.price === 'object' ? course.price : { amount: course.price, currency: 'USD' },
    thumbnail: course.thumbnail,
    tags: Array.isArray(course.tags) ? course.tags : [],
    createdAt: safeDate(course.createdAt),
  }));

  // Get latest 6 courses for slider
  const latestCourses = courses.slice(0, 6);

  let enrollmentStatuses: Record<string, string> = {};
  if (userId && courses.length) {
    const courseIds = courses.map((course) => course.id);

    const [enrollments, completions] = await Promise.all([
      db
        .collection('enrollments')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray()
        .catch(() => []),
      db
        .collection('courseCompletions')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray()
        .catch(() => []),
    ]);

    const completedIds = new Set((completions as any[]).map((item) => item.courseId));

    enrollmentStatuses = (enrollments as any[]).reduce((acc: Record<string, string>, record: any) => {
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

  const blogs = (rawBlogs as any[]).map((blog) => ({
    id: String(blog._id),
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || blog.markdown?.slice(0, 140),
    image: blog.metadata?.heroImage || blog.imageUrl,
    tags: blog.metadata?.tags || blog.tags || [],
    createdAt: safeDate(blog.createdAt),
  }));

  const subjects = (rawSubjects as any[]).map((subject) => ({
    id: String(subject._id),
    name: subject.name,
    slug: subject.slug || String(subject._id),
    description: subject.description,
    icon: subject.icon,
    category: subject.category,
  }));

  const exams = (rawExams as any[]).map((exam) => ({
    id: String(exam._id),
    name: exam.name,
    description: exam.description,
    category: exam.category,
    examType: exam.examType,
    releaseAt: safeDate(exam.releaseAt),
    tags: exam.tags || [],
    updatedAt: safeDate(exam.updatedAt),
  }));

  const practiceSets = (rawPractice as any[]).map((set) => ({
    id: String(set._id),
    title: set.title,
    description: set.description,
    questionCount: set.questionCount,
    tags: set.tags || [],
    releaseAt: safeDate(set.releaseAt),
    updatedAt: safeDate(set.updatedAt),
  }));

  const subjectCategoryBySlug = new Map<string, string>();
  const subjectCategoryByName = new Map<string, string>();
  subjects.forEach((subject) => {
    if (subject.slug) subjectCategoryBySlug.set(subject.slug.toLowerCase(), subject.category || 'General');
    if (subject.name) subjectCategoryByName.set(subject.name.toLowerCase(), subject.category || 'General');
  });

  const categoryBuckets = new Map<string, Course[]>();
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

  const courseSections = Array.from(categoryBuckets.entries()).sort(([a], [b]) => a.localeCompare(b));

  const internationalExams = exams.filter((exam) => {
    const type = `${exam.examType || ''}`.toLowerCase();
    const category = `${exam.category || ''}`.toLowerCase();
    return type.includes('international') || category.includes('international');
  });

  const categoriesSet = new Set(
    subjects
      .map((subject) => subject.category)
      .filter((category): category is string => Boolean(category && category.trim())),
  );

  if (categoryBuckets.has('General')) {
    categoriesSet.add('General');
  }

  const categories = Array.from(categoriesSet);

  // Group subjects by category for dynamic display
  const subjectsByCategory = new Map<string, typeof subjects>();
  subjects.forEach((subject) => {
    const cat = subject.category || 'General';
    if (!subjectsByCategory.has(cat)) {
      subjectsByCategory.set(cat, []);
    }
    subjectsByCategory.get(cat)!.push(subject);
  });

  // Get all categories with their subjects
  const categoryData = categories.map((cat) => ({
    name: cat,
    displayName: getCategoryDisplayName(cat),
    subjects: subjectsByCategory.get(cat) || [],
    courses: categoryBuckets.get(cat) || [],
  }));

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* Hero Section - Udemy Style */}
      <section className="bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#60a5fa] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Learning that fits
              <br />
              <span className="text-yellow-300">your schedule</span>
          </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Skills for your present (and your future). Get started with us.
            </p>
            <div className="flex flex-wrap gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 py-4 text-lg font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Get Started
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-4 text-lg font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar - Prominent */}
      <section className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <CategorySearch
            categories={categories}
            subjects={subjects.map((s) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              category: s.category || 'General',
            }))}
          />
        </div>
      </section>

      {/* Course Slider - Featured */}
      {latestCourses.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Students are viewing</h2>
            <CourseSlider courses={latestCourses} />
          </div>
        </section>
      )}

      {/* Dynamic Category Sections */}
      <div className="bg-slate-50">
        <div className="container mx-auto px-4 py-12 space-y-16">

          {/* Dynamic Category Sections */}
          {categoryData.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 bg-white">
              <CardContent className="py-16 text-center">
                <p className="text-slate-500 text-lg">No courses available yet. Start creating courses to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            categoryData.map((categoryInfo) => {
              if (categoryInfo.courses.length === 0) return null;
              
              return (
                <section key={categoryInfo.name} className="space-y-6">
                  {/* Category Header with Subcategories */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                          {categoryInfo.displayName}
                        </h2>
                        <p className="text-slate-600">
                          {categoryInfo.courses.length} {categoryInfo.courses.length === 1 ? 'course' : 'courses'} • {categoryInfo.subjects.length} {categoryInfo.subjects.length === 1 ? 'subject' : 'subjects'}
                        </p>
                      </div>
                      <Link href={`/courses?category=${encodeURIComponent(categoryInfo.name)}`}>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold">
                          Explore {categoryInfo.displayName} →
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Subcategories (Subjects) */}
                    {categoryInfo.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {categoryInfo.subjects.map((subject) => (
                          <Link
                            key={subject.id}
                            href={`/courses?category=${encodeURIComponent(categoryInfo.name)}&subject=${encodeURIComponent(subject.slug)}`}
                            className="px-4 py-2 bg-white border border-slate-300 rounded-full text-sm font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                          >
                            {subject.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Courses Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {categoryInfo.courses.slice(0, 10).map((course, courseIdx) => {
                    const badges = getBadges(course.tags, course.createdAt);
                    const enrollmentStatus = enrollmentStatuses[course.id];
                    const statusBadge =
                      enrollmentStatus === 'approved'
                        ? 'Enrolled'
                        : enrollmentStatus === 'completed'
                        ? 'Completed'
                        : enrollmentStatus === 'pending'
                        ? 'Awaiting Approval'
                        : enrollmentStatus === 'waitlisted'
                        ? 'Waitlisted'
                        : enrollmentStatus === 'rejected'
                        ? 'Rejected'
                        : null;

                    const renderActionButton = () => {
                      if (!userId) {
                        return (
                          <span className="text-xs font-semibold text-blue-600">View</span>
                        );
                      }

                      if (enrollmentStatus === 'approved' || enrollmentStatus === 'completed') {
                        return (
                          <span className="text-xs font-semibold text-green-600">
                            {enrollmentStatus === 'completed' ? 'Review' : 'Continue'}
                          </span>
                        );
                      }

                      if (enrollmentStatus === 'pending') {
                        return (
                          <span className="text-xs font-semibold text-yellow-600">Pending</span>
                        );
                      }

                      if (enrollmentStatus === 'waitlisted') {
                        return (
                          <span className="text-xs font-semibold text-blue-600">Waitlisted</span>
                        );
                      }

                      return (
                        <span className="text-xs font-semibold text-blue-600">Enroll</span>
                      );
                    };

                    return (
                      <Link key={course.id} href={`/courses/${course.slug}`}>
                        <Card className="group overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                          <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                            <img
                              src={
                                course.thumbnail ||
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                              }
                              alt={course.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {badges.map((badge) => (
                                <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'} className="text-xs">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                            {statusBadge && (
                              <div className="absolute top-2 left-2">
                                <Badge
                                  variant={
                                    enrollmentStatus === 'approved' || enrollmentStatus === 'completed'
                                      ? 'success'
                                      : enrollmentStatus === 'pending'
                                      ? 'warning'
                                      : enrollmentStatus === 'waitlisted'
                                      ? 'info'
                                      : 'error'
                                  }
                                  className="text-xs"
                                >
                                  {statusBadge}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-500 mb-2 line-clamp-2 flex-1">
                              {course.summary || 'Interactive lessons and real projects'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                              <span>{course.subject || 'General'}</span>
                              {course.level && (
                                <>
                                  <span>•</span>
                                  <span>{course.level}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-base font-bold text-slate-900">
                                {formatPrice(course.price)}
                              </span>
                              {renderActionButton()}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      );
                    })}
                  </div>
                  
                  {categoryInfo.courses.length > 10 && (
                    <div className="text-center pt-4">
                      <Link href={`/courses?category=${encodeURIComponent(categoryInfo.name)}`}>
                        <Button variant="outline" className="font-semibold">
                          View all {categoryInfo.courses.length} courses in {categoryInfo.displayName} →
                        </Button>
                      </Link>
                    </div>
                  )}
                </section>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}
