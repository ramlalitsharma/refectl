import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { requireAdmin } from '@/lib/admin-check';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

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
    
    const [users, courses, blogs, quizzes, progress] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('courses').countDocuments(),
      db.collection('blogs').countDocuments(),
      db.collection('userProgress').countDocuments(),
      db.collection('userProgress').find({}).toArray(),
    ]);

    const publishedCourses = await db.collection('courses').countDocuments({ status: 'published' });
    const activeUsers = new Set(progress.map((p: any) => p.userId)).size;
    
    const premiumUsers = await db.collection('users').countDocuments({ 
      $or: [
        { 'subscriptionStatus': 'premium' },
        { 'subscriptionStatus': 'pro' },
        { 'publicMetadata.subscriptionTier': { $in: ['premium', 'pro'] } }
      ]
    });
    const totalRevenue = premiumUsers * 19;
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
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">User Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your platform, content, and users</p>
        </div>

        {/* Stats Overview */}
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

        {/* Admin Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Content Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/courses">
                <Button variant="outline" className="w-full justify-start">
                  Manage Courses →
                </Button>
              </Link>
              <Link href="/admin/blogs">
                <Button variant="outline" className="w-full justify-start">
                  Manage Blogs →
                </Button>
              </Link>
              <Link href="/admin/subjects">
                <Button variant="outline" className="w-full justify-start">
                  Subjects & Chapters →
                </Button>
              </Link>
              <Link href="/admin/studio">
                <Button variant="outline" className="w-full justify-start">
                  Admin Studio →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  View All Users →
                </Button>
              </Link>
              <Link href="/admin/enrollments">
                <Button variant="outline" className="w-full justify-start">
                  Enrollment Operations →
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  User Analytics →
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                User Roles & Permissions →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Email Management →
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  General Settings →
                </Button>
              </Link>
              <Link href="/admin/subscriptions">
                <Button variant="outline" className="w-full justify-start">
                  Subscription Plans →
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                API Keys & Integrations →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Email Templates →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Backup & Restore →
              </Button>
            </CardContent>
          </Card>

          {/* Analytics & Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Analytics & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  View Analytics →
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                Revenue Reports →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Export Data →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Custom Reports →
              </Button>
            </CardContent>
          </Card>

          {/* AI & Automation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                AI & Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                AI Content Generator →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Automated Quizzes →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                SEO Automation →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Scheduled Tasks →
              </Button>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                Security Settings →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Audit Logs →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                GDPR Compliance →
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Data Privacy →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/admin/studio">
                <Button className="w-full">+ Create Course</Button>
              </Link>
              <Link href="/admin/studio">
                <Button className="w-full">+ Create Blog</Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">View Analytics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
