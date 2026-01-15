import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { CourseSlider } from '@/components/courses/CourseSlider';
import { CategorySearch } from '@/components/search/CategorySearch';
import { BentoFeatures } from '@/components/home/BentoFeatures';
import * as motion from 'framer-motion/client';
import { BRAND_NAME } from '@/lib/brand';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';

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
    'General': 'Featured Selection',
    'general': 'Featured Selection',
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
    title: `${BRAND_NAME} - Grow Your Skills, Build Your Future`,
    description:
      `Discover trending courses, live classes, and online batches on ${BRAND_NAME}. Start learning with AI-powered personalization today.`,
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
      .find({ visibility: 'public' })
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
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen bg-dot-grid overflow-x-hidden">
      {/* Ultra HD Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden noise-texture bg-mesh pb-32 border-b border-slate-200 dark:border-white/5" aria-labelledby="hero-title">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" aria-hidden="true" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-1000" aria-hidden="true" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-5xl mx-auto space-y-10">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-6 py-2.5 text-xs font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Intelligence Redefined
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 id="hero-title" className="text-6xl md:text-8xl lg:text-9xl font-black leading-[1] tracking-tighter text-slate-900 dark:text-white">
                Shape Your <br />
                <span className="bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                  Infinite Potential.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                Experience world-class education powered by ultra-adaptive AI. Personalized learning paths, interactive 4K environments, and industry-master certifications.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="flex flex-wrap items-center justify-center gap-6 pt-10">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" className="h-16 rounded-2xl px-12 py-8 text-xl font-black bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95" aria-label="Begin your journey">
                    Begin Journey
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="h-16 rounded-2xl px-12 py-8 text-xl font-black bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all hover:scale-105" aria-label="Open portal">
                    Open Portal
                  </Button>
                </Link>
              </SignedIn>
              <Button size="lg" variant="outline" className="h-16 rounded-2xl px-10 py-8 text-xl font-black border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 backdrop-blur-md transition-all active:scale-95">
                Explore 4K Demos
              </Button>
            </FadeIn>
          </div>
        </div>

        {/* Floating Stat Widgets for Depth */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <HeroStat icon="💎" label="Premium Courses" value="500+" />
          <HeroStat icon="⚡" label="Active Learners" value="50k+" />
          <HeroStat icon="🎯" label="Certified Paths" value="120+" />
          <HeroStat icon="🧩" label="Skill Modules" value="2.5k+" />
        </div>
      </section>

      {/* Glassmorphic Search & Features Showcase */}
      <section className="relative z-20 -mt-16">
        <div className="container mx-auto px-4">
          <div className="glass-effect p-4 md:p-8 rounded-[2rem] shadow-2xl max-w-5xl mx-auto">
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
        </div>
      </section>

      {/* Bento Grid Features */}
      <BentoFeatures />

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
                  <div className="flex flex-col gap-8 mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                        <Badge variant="inverse" className="bg-blue-600 text-[10px] font-black uppercase tracking-widest px-3">
                          {categoryInfo.displayName}
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                          {categoryInfo.name.toLowerCase() === 'general' ? 'Featured Courses' : `Explore ${categoryInfo.displayName}`}
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                          {categoryInfo.courses.length} {categoryInfo.courses.length === 1 ? 'Premium Course' : 'World-Class Courses'} • {categoryInfo.subjects.length} Specialized Paths
                        </p>
                      </div>
                      <Link href={`/courses?category=${encodeURIComponent(categoryInfo.name)}`}>
                        <Button variant="outline" className="rounded-2xl px-6 py-6 font-bold border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all">
                          View All Specializations →
                        </Button>
                      </Link>
                    </div>

                    {/* Subcategories (Subjects) as minimal pills */}
                    {categoryInfo.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {categoryInfo.subjects.map((subject) => (
                          <Link
                            key={subject.id}
                            href={`/courses?category=${encodeURIComponent(categoryInfo.name)}&subject=${encodeURIComponent(subject.slug)}`}
                            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all"
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
                        <motion.div
                          key={course.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: courseIdx * 0.05 }}
                        >
                          <Link href={`/courses/${course.slug}`}>
                            <Card className="group relative overflow-hidden border-none bg-white hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer h-full flex flex-col rounded-3xl">
                              {/* Shimmer Effect on Hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-10"></div>

                              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                <Image
                                  src={
                                    course.thumbnail ||
                                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                                  }
                                  alt={course.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                  {badges.map((badge) => (
                                    <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'} className="text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/10 border-white/20 text-white">
                                      {badge}
                                    </Badge>
                                  ))}
                                </div>
                                {statusBadge && (
                                  <div className="absolute top-3 left-3">
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
                                      className="text-xs font-bold"
                                    >
                                      {statusBadge}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{course.subject || 'General'}</span>
                                  {course.level && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</span>
                                    </>
                                  )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1 leading-relaxed">
                                  {course.summary || 'Interactive lessons and real projects'}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                  <div>
                                    <span className="text-xs text-slate-400 block mb-0.5">Price</span>
                                    <span className="text-xl font-black text-slate-900">
                                      {formatPrice(course.price)}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 px-4 py-2 rounded-xl">
                                    {renderActionButton()}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
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

function HeroStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <ScaleIn>
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border-white/10">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{value}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{label}</div>
        </div>
      </div>
    </ScaleIn>
  );
}
