import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { requireSuperAdmin, getUserRole, isSuperAdmin } from '@/lib/admin-check';
import { ViewAsSwitcher } from '@/components/admin/ViewAsSwitcher';

export const dynamic = 'force-dynamic';

type ConsoleTile = {
  name: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  action?: string;
};

export default async function SuperAdminConsolePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireSuperAdmin();
  } catch {
    redirect('/admin');
  }

  const role = await getUserRole();
  const isSuperAdminUser = await isSuperAdmin();

  let stats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalVideos: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  };

  try {
    const db = await getDatabase();

    const [
      users,
      admins,
      teachers,
      courses,
      blogs,
      videos,
      premiumUsers,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({
        $or: [{ role: 'admin' }, { isAdmin: true }],
      }),
      db.collection('users').countDocuments({
        $or: [{ role: 'teacher' }, { isTeacher: true }],
      }),
      db.collection('courses').countDocuments(),
      db.collection('blogs').countDocuments(),
      db.collection('videos').countDocuments().catch(() => 0),
      db.collection('users').countDocuments({
        $or: [
          { subscriptionStatus: 'premium' },
          { subscriptionStatus: 'pro' },
          { 'publicMetadata.subscriptionTier': { $in: ['premium', 'pro'] } },
        ],
      }),
    ]);

    const totalRevenue = premiumUsers * 19;

    stats = {
      totalUsers: users,
      totalAdmins: admins,
      totalTeachers: teachers,
      totalCourses: courses,
      totalBlogs: blogs,
      totalVideos: videos,
      totalRevenue,
      monthlyRevenue: totalRevenue,
    };
  } catch (e) {
    console.error('Super admin console stats error:', e);
  }

  const governanceTiles: ConsoleTile[] = [
    {
      name: 'User & Role Directory',
      description:
        'Create and manage superadmins, admins, teachers, and role assignments.',
      href: '/admin/users',
      icon: '👤',
      action: 'Open user management',
      badge: `${stats.totalUsers} users`,
    },
    {
      name: 'Role & Permission Sets',
      description:
        'Design reusable role templates and fine-grained permission policies.',
      href: '/admin/roles',
      icon: '🧩',
      action: 'Configure roles',
    },
    {
      name: 'System Settings',
      description:
        'Platform branding, navigation, SEO defaults, and global configuration.',
      href: '/admin/settings',
      icon: '⚙️',
      action: 'Edit system settings',
    },
    {
      name: 'Schemas & Developer Console',
      description:
        'Manage content schemas, API surfaces, and developer-facing configuration.',
      href: '/admin/schemas',
      icon: '🧬',
      action: 'Open schema manager',
    },
  ];

  const operationsTiles: ConsoleTile[] = [
    {
      name: 'Content Studios',
      description: 'Central hub for courses, blogs, tutorials, ebooks, and more.',
      href: '/admin/studio',
      icon: '🎨',
      action: 'Launch studio hub',
    },
    {
      name: 'Videos & Live Classes',
      description:
        'Video library, streaming configuration, and live Jitsi classrooms.',
      href: '/admin/videos',
      icon: '🎥',
      action: 'Manage videos',
      badge: `${stats.totalVideos} videos`,
    },
    {
      name: 'Enrollments & Exams',
      description:
        'Enrollment operations, exams, and assessment orchestration.',
      href: '/admin/enrollments',
      icon: '✅',
      action: 'Open enrollment ops',
    },
    {
      name: 'Moderation & Safety',
      description: 'Moderation queue, reviews, and support operations.',
      href: '/admin/moderation',
      icon: '🛡️',
      action: 'Review queue',
    },
  ];

  const monetizationTiles: ConsoleTile[] = [
    {
      name: 'Subscriptions & Plans',
      description:
        'Control pricing, bundles, coupons, and subscription tiers.',
      href: '/admin/subscriptions',
      icon: '💳',
      action: 'Manage plans',
    },
    {
      name: 'Revenue & Analytics',
      description:
        'Advanced analytics, exports, and performance dashboards.',
      href: '/analytics/admin/advanced',
      icon: '📊',
      action: 'Open analytics',
    },
    {
      name: 'Analytics Export (CSV)',
      description:
        'One-click export of platform analytics for offline analysis.',
      href: '/api/admin/analytics/export?format=csv&type=all',
      icon: '⬇️',
      action: 'Download CSV export',
    },
    {
      name: 'Analytics Export (JSON)',
      description:
        'Full JSON export of revenue, user, and course analytics.',
      href: '/api/admin/analytics/export?format=json&type=all',
      icon: '🧾',
      action: 'Download JSON export',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <SiteBrand />
          <div className="flex items-center gap-3">
            {isSuperAdminUser && (
              <ViewAsSwitcher currentRole={role || 'student'} isSuperAdmin={isSuperAdminUser} />
            )}
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Center
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Learner View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              Super Admin Console
            </h1>
            <p className="text-sm text-slate-500">
              Simple control panel for everything: users, roles, content,
              billing, and system configuration.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200">
              Full platform access
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.totalAdmins} admins • ${stats.totalTeachers} teachers`}
            icon="👥"
            trend=""
          />
          <StatCard
            title="Courses"
            value={stats.totalCourses.toLocaleString()}
            subtitle={`${stats.totalBlogs} blogs`}
            icon="📚"
            trend=""
          />
          <StatCard
            title="Videos"
            value={stats.totalVideos.toLocaleString()}
            subtitle="In library"
            icon="🎥"
            trend=""
          />
          <StatCard
            title="Monthly Revenue (est.)"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="From premium users"
            icon="💰"
            trend=""
          />
        </section>

        <ConsoleSection
          title="Users, Roles & Security"
          description="Manage people, roles, and global settings."
          tiles={governanceTiles}
        />

        <ConsoleSection
          title="Content & Operations"
          description="Studios, videos, enrollments, and moderation."
          tiles={operationsTiles}
        />

        <ConsoleSection
          title="Monetization & Analytics"
          description="Subscriptions, revenue dashboards, and exports."
          tiles={monetizationTiles}
          columns="md:grid-cols-2 xl:grid-cols-4"
        />

        <ConsoleSection
          title="Dashboard Access"
          description="Quick access to view any role's dashboard experience."
          tiles={[
            {
              name: 'Super Admin Console',
              description: 'Your current full-control console with all platform features.',
              href: '/admin/super',
              icon: '🛡️',
              action: 'Open console',
            },
            {
              name: 'Admin Dashboard',
              description: 'View the admin dashboard experience for content and user management.',
              href: '/admin/dashboard?viewAs=admin',
              icon: '👨‍💼',
              action: 'View as Admin',
            },
            {
              name: 'Teacher Dashboard',
              description: 'See what teachers see: course creation, student progress, and content tools.',
              href: '/teacher/dashboard?viewAs=teacher',
              icon: '👨‍🏫',
              action: 'View as Teacher',
            },
            {
              name: 'Student Dashboard',
              description: 'Experience the learner view: courses, progress, quizzes, and recommendations.',
              href: '/dashboard?viewAs=student',
              icon: '🎓',
              action: 'View as Student',
            },
          ]}
          columns="md:grid-cols-2 xl:grid-cols-4"
        />
      </main>
    </div>
  );
}

function ConsoleSection({
  title,
  description,
  tiles,
  columns = 'md:grid-cols-2 xl:grid-cols-3',
}: {
  title: string;
  description: string;
  tiles: ConsoleTile[];
  columns?: string;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className={`grid gap-4 ${columns}`}>
        {tiles.map((tile) => (
          <Card
            key={tile.name}
            hover
            className="border border-slate-200 bg-white shadow-sm"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
              <CardTitle className="flex items-start gap-3">
                <span className="text-2xl">{tile.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {tile.name}
                  </div>
                  <p className="text-xs text-slate-500">{tile.description}</p>
                </div>
              </CardTitle>
              {tile.badge && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                  {tile.badge}
                </span>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild size="sm" className="w-full">
                <Link href={tile.href}>{tile.action || `Open ${tile.name}`}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}


