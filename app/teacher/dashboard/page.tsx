import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { getUserRole, isSuperAdmin } from '@/lib/admin-check';
import { ViewAsSwitcher } from '@/components/admin/ViewAsSwitcher';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const role = await getUserRole();
  const isSuperAdminUser = await isSuperAdmin();
  
  // Allow access if user is teacher, admin, superadmin, or viewing as teacher
  const canAccess = role === 'teacher' || role === 'admin' || role === 'superadmin';
  
  if (!canAccess) {
    redirect('/dashboard');
  }

  const user = await currentUser();
  const db = await getDatabase();

  type CourseLite = {
    _id: unknown;
    status?: string;
    modules?: { lessons?: unknown[] }[];
  };

  let stats = {
    myCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalBlogs: 0,
    totalQuizzes: 0,
  };

  try {
    // Get teacher's courses
    const myCourses = (await db
      .collection('courses')
      .find({ createdBy: userId })
      .toArray()) as CourseLite[];

    const publishedCourses = myCourses.filter((c) => c.status === 'published');

    // Get total enrollments across teacher's courses
    const courseIds = myCourses.map((c) => String(c._id));
    const totalEnrollments = await db
      .collection('enrollments')
      .countDocuments({ courseId: { $in: courseIds } });

    // Count lessons across all courses
    const totalLessons = myCourses.reduce((sum, course) => {
      const modules = Array.isArray(course.modules) ? course.modules : [];
      const lessonCount = modules.reduce((acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
      return sum + lessonCount;
    }, 0);

    // Get teacher's blogs
    const myBlogs = await db
      .collection('blogs')
      .countDocuments({ createdBy: userId });

    // Get teacher's quizzes/question banks
    const myQuizzes = await db
      .collection('questionBanks')
      .countDocuments({ createdBy: userId });

    stats = {
      myCourses: myCourses.length,
      publishedCourses: publishedCourses.length,
      totalStudents: totalEnrollments,
      totalLessons,
      totalBlogs: myBlogs,
      totalQuizzes: myQuizzes,
    };
  } catch (e) {
    console.error('Teacher stats error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-3">
            {isSuperAdminUser && (
              <ViewAsSwitcher currentRole={role || 'student'} isSuperAdmin={isSuperAdminUser} />
            )}
            <ThemeToggle />
            {role === 'superadmin' && (
              <Link href="/admin/super">
                <Button variant="outline" size="sm">Super Admin Console</Button>
              </Link>
            )}
            {(role === 'admin' || role === 'superadmin') && (
              <Link href="/admin">
                <Button variant="outline" size="sm">Admin Panel</Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Student View</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back, {user?.firstName || user?.email || 'Teacher'}! Manage your courses, track student progress, and create engaging content.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="My Courses"
            value={stats.myCourses.toLocaleString()}
            subtitle={`${stats.publishedCourses} published`}
            icon="📚"
            trend="•"
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            subtitle="Enrolled in your courses"
            icon="👥"
            trend="•"
          />
          <StatCard
            title="Total Lessons"
            value={stats.totalLessons.toLocaleString()}
            subtitle="Across all courses"
            icon="📖"
            trend="•"
          />
          <StatCard
            title="Blog Posts"
            value={stats.totalBlogs.toLocaleString()}
            subtitle="Published articles"
            icon="📝"
            trend="•"
          />
          <StatCard
            title="Question Banks"
            value={stats.totalQuizzes.toLocaleString()}
            subtitle="Quiz collections"
            icon="❓"
            trend="•"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/studio/courses">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Create Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Design and publish new courses with AI-powered outlines
                </p>
                <Button className="w-full">Create Course →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/studio/blogs">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Write Blog Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Publish SEO-optimized blog posts and articles
                </p>
                <Button className="w-full">Write Blog →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/studio/questions">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">❓</span>
                  Create Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Build question banks and adaptive quizzes
                </p>
                <Button className="w-full">Create Quiz →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/courses">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Manage Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Edit, publish, and manage your course library
                </p>
                <Button className="w-full">Manage →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/enrollments">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  View Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  See who&apos;s enrolled in your courses
                </p>
                <Button className="w-full">View →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card hover className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Course Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Track performance and engagement metrics
                </p>
                <Button className="w-full">View Analytics →</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Teaching Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📚 Course Studio</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Create comprehensive courses with modules, lessons, and resources
                </p>
                <Link href="/admin/studio/courses">
                  <Button variant="outline" size="sm">Open Studio →</Button>
                </Link>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🎥 Video Library</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Upload and manage video content for your courses
                </p>
                <Link href="/admin/videos">
                  <Button variant="outline" size="sm">Manage Videos →</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

