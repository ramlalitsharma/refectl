import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { requireAdmin, getUserRole, isSuperAdmin } from '@/lib/admin-check';
import { ViewAsSwitcher } from '@/components/admin/ViewAsSwitcher';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const role = await getUserRole();
  const isSuperAdminUser = await isSuperAdmin();

  let stats = {
    totalUsers: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalQuizzes: 0,
    activeUsers: 0,
    publishedCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  };

  try {
    const db = await getDatabase();
    
    // Get all stats
    const [users, courses, blogs, quizzes, progress] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('courses').countDocuments(),
      db.collection('blogs').countDocuments(),
      db.collection('userProgress').countDocuments(),
      db.collection('userProgress').find({}).toArray(),
    ]);

    const publishedCourses = await db.collection('courses').countDocuments({ status: 'published' });
    const activeUsers = new Set(progress.map((p: any) => p.userId)).size;
    
    // Calculate revenue (mock for now - integrate with subscription provider)
    const premiumUsers = await db.collection('users').countDocuments({ 
      $or: [
        { 'subscriptionStatus': 'premium' },
        { 'subscriptionStatus': 'pro' },
        { 'publicMetadata.subscriptionTier': { $in: ['premium', 'pro'] } }
      ]
    });
    const totalRevenue = premiumUsers * 19; // $19/month
    const monthlyRevenue = totalRevenue;

    stats = {
      totalUsers: users,
      totalCourses: courses,
      totalBlogs: blogs,
      totalQuizzes: quizzes,
      activeUsers,
      publishedCourses,
      totalRevenue,
      monthlyRevenue,
    };
  } catch (e) {
    console.error('Admin stats error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            {isSuperAdminUser && (
              <ViewAsSwitcher currentRole={role || 'student'} isSuperAdmin={isSuperAdminUser} />
            )}
            <ThemeToggle />
            {role === 'superadmin' && (
              <Link href="/admin/super">
                <Button variant="outline" size="sm">Super Admin Console</Button>
              </Link>
            )}
            <Link href="/admin">
              <Button variant="outline" size="sm">← Admin Panel</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">User Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your platform's performance and content</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.activeUsers} active`}
            icon="👥"
            trend="+12%"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses.toLocaleString()}
            subtitle={`${stats.publishedCourses} published`}
            icon="📚"
            trend="+5"
          />
          <StatCard
            title="Total Quizzes"
            value={stats.totalQuizzes.toLocaleString()}
            subtitle="Completed"
            icon="✅"
            trend="+23%"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="From subscriptions"
            icon="💰"
            trend="+8%"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/courses">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  Manage Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create, edit, publish, and manage all courses
                </p>
                <Button className="w-full">View Courses →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  View, edit, and manage user accounts and roles
                </p>
                <Button className="w-full">View Users →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/blogs">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Manage Blogs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create, edit, and manage blog posts
                </p>
                <Button className="w-full">View Blogs →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Detailed analytics and insights
                </p>
                <Button className="w-full">View Analytics →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/subjects">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📖</span>
                  Subjects & Chapters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage subjects, levels, and chapters
                </p>
                <Button className="w-full">Manage →</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/studio">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  Admin Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  AI-powered content creation
                </p>
                <Button className="w-full">Open Studio →</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <span className="text-2xl">📚</span>
                <div className="flex-1">
                  <div className="font-medium">New course published</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <div className="font-medium">New user registered</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <div className="font-medium">Quiz completed</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">1 day ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

