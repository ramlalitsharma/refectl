import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { CourseLibrary } from '@/components/courses/CourseLibrary';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ categoryName: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categoryName } = await params;
  const { type } = await searchParams;
  const { userId } = await auth();
  
  const decodedCategory = decodeURIComponent(categoryName);
  const db = await getDatabase();

  // Fetch all subjects to get categories
  const rawSubjects = await db.collection('subjects').find({}).toArray();
  const subjects = rawSubjects.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    slug: s.slug || String(s._id),
    category: s.category || 'General',
  }));

  // Create category mapping
  const subjectCategoryBySlug = new Map<string, string>();
  const subjectCategoryByName = new Map<string, string>();
  subjects.forEach((subject) => {
    if (subject.slug) subjectCategoryBySlug.set(subject.slug.toLowerCase(), subject.category);
    if (subject.name) subjectCategoryByName.set(subject.name.toLowerCase(), subject.category);
  });

  // Get all unique categories
  const categories = Array.from(new Set(subjects.map((s) => s.category).filter(Boolean)));
  if (!categories.includes('General')) categories.push('General');
  const categoryList = categories.map((cat) => ({
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
    count: 0, // Will be calculated
  }));

  let courses: any[] = [];
  let exams: any[] = [];
  let blogs: any[] = [];
  let enrollmentStatuses: Record<string, string> = {};

  // Fetch courses
  if (!type || type === 'courses') {
    const rawCourses = await db
      .collection('courses')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    courses = rawCourses
      .map((course: any) => {
        const subjectKey = course.subject ? course.subject.toLowerCase() : '';
        const category =
          subjectCategoryBySlug.get(subjectKey) ||
          subjectCategoryByName.get(subjectKey) ||
          'General';
        return { ...course, category };
      })
      .filter((course: any) => course.category === decodedCategory)
      .map((course: any) => ({
        _id: String(course._id),
        slug: course.slug || String(course._id),
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
      }));

    // Get enrollment statuses
    if (userId && courses.length) {
      const courseIds = courses.map((c) => c._id || c.slug).filter(Boolean);
      const enrollments = await db
        .collection('enrollments')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray();
      const completions = await db
        .collection('courseCompletions')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray();

      const completedIds = new Set(completions.map((item: any) => item.courseId));
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
  }

  // Fetch exams
  if (!type || type === 'exams') {
    const rawExams = await db
      .collection('examTemplates')
      .find({ visibility: { $in: ['public', undefined] } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    exams = rawExams
      .filter((exam: any) => (exam.category || 'General') === decodedCategory)
      .map((exam: any) => ({
        id: exam.examType || String(exam._id),
        name: exam.name,
        fullName: exam.name,
        description: exam.description || '',
        duration: `${Math.floor((exam.durationMinutes || 60) / 60)}h ${(exam.durationMinutes || 60) % 60}m`,
        scoring: exam.totalMarks ? `0-${exam.totalMarks}` : 'Varies',
        sections: exam.sections?.length || 1,
        icon: '📝',
        category: exam.category || 'General',
      }));
  }

  // Fetch blogs
  if (!type || type === 'blogs') {
    const rawBlogs = await db
      .collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    blogs = rawBlogs
      .filter((blog: any) => (blog.metadata?.category || 'General') === decodedCategory)
      .map((blog: any) => ({
        id: String(blog._id),
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt || blog.markdown?.slice(0, 140),
        image: blog.metadata?.heroImage || blog.imageUrl,
        tags: blog.metadata?.tags || blog.tags || [],
        createdAt: blog.createdAt instanceof Date ? blog.createdAt.toISOString() : blog.createdAt,
        category: blog.metadata?.category || 'General',
      }));
  }

  return (
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Category', href: '/category' },
            { label: decodedCategory },
          ]}
          className="mb-4"
        />

        <Card className="border-none shadow-2xl bg-gradient-to-br from-teal-600 via-emerald-500 to-indigo-500 text-white">
          <CardContent className="p-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                <span>📚</span> {decodedCategory}
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                {decodedCategory} Learning Resources
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                Explore curated {decodedCategory.toLowerCase()} courses, exams, and learning materials designed to help you achieve your goals.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
              <p className="text-sm text-slate-500">
                Switch between categories to explore different learning areas.
              </p>
            </div>
            <CategoryNavigation
              categories={categoryList}
              currentCategory={decodedCategory}
              basePath={`/category/${categoryName}`}
            />
          </CardContent>
        </Card>

        {(!type || type === 'courses') && courses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{decodedCategory} Courses</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
                </p>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="sm">View All Courses</Button>
              </Link>
            </div>
            <CourseLibrary
              courses={courses}
              initialEnrollmentStatuses={enrollmentStatuses}
              isAuthenticated={Boolean(userId)}
            />
          </div>
        )}

        {(!type || type === 'exams') && exams.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{decodedCategory} Exams</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {exams.length} {exams.length === 1 ? 'exam' : 'exams'} available
                </p>
              </div>
              <Link href="/exams">
                <Button variant="outline" size="sm">View All Exams</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all border-none shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl">{exam.icon}</div>
                        <Badge variant="warning" size="sm">Test Prep</Badge>
                      </div>
                      <CardTitle className="text-xl">{exam.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{exam.fullName}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{exam.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{exam.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scoring:</span>
                          <span className="font-medium">{exam.scoring}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(!type || type === 'blogs') && blogs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{decodedCategory} Blogs</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {blogs.length} {blogs.length === 1 ? 'article' : 'articles'} available
                </p>
              </div>
              <Link href="/blog">
                <Button variant="outline" size="sm">View All Blogs</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all border-none shadow-md">
                    {blog.image && (
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3">{blog.excerpt}</p>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {blog.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="info" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && exams.length === 0 && blogs.length === 0 && (
          <Card className="border-dashed border-2 border-teal-200 bg-white/70">
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No content found</h3>
              <p className="text-sm text-slate-500">
                There are no {decodedCategory.toLowerCase()} courses, exams, or blogs available yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

