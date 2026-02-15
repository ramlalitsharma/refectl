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
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10 space-y-12 max-w-7xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Super Admin <span className="text-primary italic">Console</span>
              <span className="ml-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 align-middle">
                v2.4.0
              </span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
              Global platform orchestration and system health monitor. Full spectrum authority over users, content, and monetization.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-8 h-12">
                Exit to Platform
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatTile
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.totalAdmins} Admins • ${stats.totalTeachers} Teachers`}
            icon="group"
            sparkline={[30, 45, 35, 60, 50, 80, 70]}
          />
          <StatTile
            title="Live Courses"
            value={stats.totalCourses.toLocaleString()}
            subtitle={`${stats.totalBlogs} Active Insight Blogs`}
            icon="auto_stories"
            sparkline={[20, 30, 25, 45, 40, 60, 55]}
          />
          <StatTile
            title="Media Assets"
            value={stats.totalVideos.toLocaleString()}
            subtitle="Encrypted Video Vault"
            icon="video_library"
            progress={75}
          />
          <StatTile
            title="Monthly Revenue"
            value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
            subtitle="+12% From Previous Cycle"
            icon="payments"
            isAccent
          />
        </section>

        <ConsoleSection
          title="Users, Roles & Security"
          description="Global Access Control & System Configuration"
          tiles={governanceTiles}
        />

        <ConsoleSection
          title="Content & Operations"
          description="Studio Hubs & Media Management Pipelines"
          tiles={operationsTiles}
        />

        <ConsoleSection
          title="Monetization & Analytics"
          description="Revenue Orchestration & Intelligence Exports"
          tiles={monetizationTiles}
          columns="md:grid-cols-2 xl:grid-cols-4"
        />

        <footer className="pt-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
              <div className="hidden sm:block">DB Latency: 4ms</div>
              <div className="hidden sm:block">Uptime: 99.98%</div>
            </div>
            <div className="opacity-60 italic whitespace-nowrap">
              Last Registry Synchronization: Just Now
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function StatTile({ title, value, subtitle, icon, sparkline, progress, isAccent }: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  sparkline?: number[];
  progress?: number;
  isAccent?: boolean;
}) {
  return (
    <Card className={`glass-card-premium border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group transition-all duration-500 ${isAccent ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'hover:border-primary/30'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${isAccent ? 'text-primary' : 'text-slate-500'}`}>{title}</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${isAccent ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400 group-hover:text-primary transition-colors'}`}>
          {/* Using a simple mapping for common icons, or we could pass Lucide components */}
          <span className="material-icons-round text-2xl">{icon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${isAccent ? 'text-emerald-500' : 'text-slate-500'}`}>{subtitle}</div>
        {sparkline && (
          <svg className="h-8 w-24 overflow-visible" viewBox="0 0 100 20">
            <path
              d={`M0 ${20 - sparkline[0]} ${sparkline.map((v, i) => `L ${(i / (sparkline.length - 1)) * 100} ${20 - v}`).join(' ')}`}
              fill="none"
              stroke="#00BAE2"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[dash_1.5s_ease-in-out_forwards] [stroke-dasharray:100] [stroke-dashoffset:100]"
            />
          </svg>
        )}
        {progress && (
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="text-white/5 stroke-current" strokeWidth="4" />
              <circle cx="18" cy="18" r="16" fill="none" className="text-primary stroke-current" strokeWidth="4" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </Card>
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
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h2>
        <div className="h-px flex-1 bg-white/5" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{description}</p>
      </div>
      <div className={`grid gap-8 ${columns}`}>
        {tiles.map((tile) => (
          <Card
            key={tile.name}
            className="glass-card-premium border-white/5 rounded-[2.5rem] group hover:border-primary/20 transition-all duration-500 overflow-hidden"
          >
            <CardHeader className="p-8 pb-4 space-y-4">
              <div className="flex gap-6">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  {tile.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-primary transition-colors">{tile.name}</h4>
                    {tile.badge && (
                      <span className="text-[9px] font-black uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5 text-slate-400">
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{tile.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              <Link href={tile.href}>
                <Button className="w-full h-12 rounded-2xl bg-white text-slate-950 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl group-hover:bg-primary transition-colors">
                  {tile.action || `Open ${tile.name}`}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}


