import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { getUserRole, requireAdmin } from '@/lib/admin-check';

export const dynamic = 'force-dynamic';

type StudioTile = {
  name: string;
  description: string;
  href: string;
  icon: string;
  metric?: string;
  action?: string;
};

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // If the logged-in user is a superadmin, send them to the dedicated
  // Super Admin Console instead of the regular admin control center.
  const role = await getUserRole();
  if (role === 'superadmin') {
    redirect('/admin/super');
  }

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
    totalQuestionBanks: 0,
    totalExams: 0,
  };

  try {
    const db = await getDatabase();

    const [
      users,
      courses,
      blogs,
      quizzes,
      progress,
      publishedCourses,
      questionBanks,
      exams,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('courses').countDocuments(),
      db.collection('blogs').countDocuments(),
      db.collection('userProgress').countDocuments(),
      db
        .collection('userProgress')
        .find({})
        .project({ userId: 1 })
        .toArray(),
      db.collection('courses').countDocuments({ status: 'published' }),
      db.collection('questionBanks').countDocuments(),
      db.collection('examTemplates').countDocuments(),
    ]);

    const activeUsers = new Set(
      (progress as Array<{ userId?: string }>).map((p) => p.userId)
    ).size;

    const premiumUsers = await db.collection('users').countDocuments({
      $or: [
        { subscriptionStatus: 'premium' },
        { subscriptionStatus: 'pro' },
        { 'publicMetadata.subscriptionTier': { $in: ['premium', 'pro'] } },
      ],
    });

    const totalRevenue = premiumUsers * 19;

    stats = {
      totalUsers: users,
      totalCourses: courses,
      totalBlogs: blogs,
      totalQuizzes: quizzes,
      activeUsers,
      publishedCourses,
      totalRevenue,
      monthlyRevenue: totalRevenue,
      totalQuestionBanks: questionBanks,
      totalExams: exams,
    };
  } catch (e) {
    console.error('Admin stats error:', e);
  }

  const contentStudios: StudioTile[] = [
    {
      name: 'Course Studio',
      description: 'Design curricula with AI, manual builders, and workflow approvals.',
      href: '/admin/studio/courses',
      icon: '📚',
      metric: `${stats.totalCourses} total • ${stats.publishedCourses} published`,
      action: 'Launch course studio',
    },
    {
      name: 'Blog Studio',
      description: 'Publish SEO-optimized editorials with CTA management and preview.',
      href: '/admin/studio/blogs',
      icon: '📝',
      metric: `${stats.totalBlogs} total posts`,
      action: 'Create blog post',
    },
    {
      name: 'Tutorial Studio',
      description: 'Author interactive tutorials, lectures, and lesson scripts.',
      href: '/admin/studio/tutorials',
      icon: '🎥',
      metric: 'Coming soon',
      action: 'Open tutorial studio',
    },
    {
      name: 'Ebook / Notes Studio',
      description: 'Compose chapter-wise study notes, ebooks, and downloadable summaries.',
      href: '/admin/studio/ebooks',
      icon: '📘',
      metric: 'Coming soon',
      action: 'Draft ebook',
    },
  ];

  const assessmentStudios: StudioTile[] = [
    {
      name: 'Question & Quiz Studio',
      description: 'Create MCQs, subjective items, and tag them by curriculum & difficulty.',
      href: '/admin/studio/questions',
      icon: '❓',
      metric: `${stats.totalQuestionBanks} question banks`,
      action: 'Build question bank',
    },
    {
      name: 'Exam & Prep Studio',
      description: 'Blueprint mock tests, exam preparations, and release schedules.',
      href: '/admin/studio/exams',
      icon: '🧠',
      metric: `${stats.totalExams} templates`,
      action: 'Design exam',
    },
    {
      name: 'MCQ Model Papers',
      description: 'Generate model papers for Loksewa, international, and competitive exams.',
      href: '/admin/studio/model-papers',
      icon: '📄',
      metric: 'Coming soon',
      action: 'Create model paper',
    },
    {
      name: 'Practice Sets & Tests',
      description: 'Assemble adaptive practice sets with category-driven analytics.',
      href: '/admin/studio/practice',
      icon: '📝',
      metric: 'Coming soon',
      action: 'Build practice set',
    },
  ];

  const operationsTiles: StudioTile[] = [
    {
      name: 'User Management',
      description: 'Create and manage superadmins, admins, and teachers with role-based access.',
      href: '/admin/users',
      icon: '👥',
      action: 'Manage users',
      metric: `${stats.totalUsers} users`,
    },
    {
      name: 'Video Library',
      description: 'Upload, manage, and link videos to courses from a centralized library.',
      href: '/admin/videos',
      icon: '🎥',
      action: 'Manage videos',
      metric: 'Video library',
    },
    {
      name: 'Enrollment Ops',
      description: 'Process enrollment approvals, cohorts, and waitlists.',
      href: '/admin/enrollments',
      icon: '✅',
      action: 'Open enrollments',
    },
    {
      name: 'Role Management',
      description: 'Assign permissions with reusable roles and policies.',
      href: '/admin/roles',
      icon: '🧩',
      action: 'Manage roles',
    },
    {
      name: 'Moderation Queue',
      description: 'Approve reviews and resolve support tickets.',
      href: '/admin/moderation',
      icon: '🛡️',
      action: 'Review submissions',
      metric: 'Reviews & tickets',
    },
    {
      name: 'Notifications Studio',
      description: 'Design templates and automate event-based messaging.',
      href: '/admin/studio/notifications',
      icon: '🔔',
      action: 'Manage notifications',
    },
    {
      name: 'Subscriptions & Plans',
      description: 'Control pricing, free tiers, and commercial offerings.',
      href: '/admin/subscriptions',
      icon: '💳',
      action: 'Manage plans',
    },
    {
      name: 'Analytics',
      description: 'View platform analytics, performance, and funnel metrics.',
      href: '/admin/analytics',
      icon: '📊',
      action: 'View analytics',
    },
    {
      name: 'Strategic Insights',
      description: 'AI-driven worldwide problem analysis and market expansion solutions.',
      href: '/admin/insights',
      icon: '🧠',
      action: 'Launch intelligence',
      metric: 'Global BI Active',
    },
  ];

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 selection:bg-elite-accent-cyan/30">
      <main className="container mx-auto px-4 py-16 space-y-16">
        <section className="relative">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-elite-accent-cyan/10 rounded-full blur-[100px]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Neural Command Center</h3>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            Administrative <br />
            <span className="text-gradient-cyan">Relay Pulse</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-6 max-w-2xl">
            Global orchestration of learning assets, cognitive telemetry, and economic logic from a unified intelligence studio.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Intelligence Nodes"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`L-${stats.activeUsers} Weekly Relay`}
            icon="👥"
            trend="Stable"
          />
          <StatCard
            title="Curriculum Assets"
            value={stats.totalCourses.toLocaleString()}
            subtitle={`${stats.publishedCourses} Deployed`}
            icon="📚"
            trend="Active"
          />
          <StatCard
            title="Knowledge Clusters"
            value={stats.totalQuestionBanks.toLocaleString()}
            subtitle="Neural Map Integration"
            icon="❓"
            trend="Optimal"
          />
          <StatCard
            title="Economic Throughput"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="Tier 1 Pro Relay"
            icon="💰"
            trend="Growth"
          />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Asset Studios</h2>
            <Link href="/admin/studio">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-elite-accent-cyan hover:bg-elite-accent-cyan/10">All Terminals</Button>
            </Link>
          </div>
          <StudioGrid tiles={contentStudios} />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Intelligence & Evaluation</h2>
          </div>
          <StudioGrid tiles={assessmentStudios} />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Global Operations</h2>
          </div>
          <StudioGrid tiles={operationsTiles} columns="md:grid-cols-2 xl:grid-cols-3" />
        </section>

        <div className="glass-card-premium rounded-[3rem] border border-white/5 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-elite-accent-cyan/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Priority Overrides</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-14 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-elite-accent-cyan transition-all shadow-xl shadow-white/5">
              <Link href="/admin/studio/courses">+ Initialize Course</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:border-elite-accent-cyan transition-all">
              <Link href="/admin/studio/questions">+ Assemble Quiz</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:border-elite-accent-cyan transition-all">
              <Link href="/admin/studio/exams">+ Deploy Exam</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:border-elite-accent-cyan transition-all">
              <Link href="/admin/studio/blogs">+ Draft Intelligence</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:border-elite-accent-cyan transition-all">
              <Link href="/admin/users">Node Oversight</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:border-elite-accent-cyan transition-all">
              <Link href="/admin/analytics">Neural Metrics</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StudioGrid({ tiles, columns = 'md:grid-cols-2 xl:grid-cols-3' }: { tiles: StudioTile[]; columns?: string }) {
  return (
    <div className={`grid gap-6 ${columns}`}>
      {tiles.map((tile) => (
        <div key={tile.name} className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-elite-accent-cyan/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500 shadow-xl border border-white/5">
                {tile.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{tile.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{tile.description}</p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              {tile.metric && (
                <div className="text-[9px] font-black uppercase tracking-widest text-elite-accent-cyan bg-elite-accent-cyan/5 border border-elite-accent-cyan/10 px-3 py-1.5 rounded-lg inline-block">
                  {tile.metric}
                </div>
              )}
              <Button asChild className="w-full h-11 rounded-xl border border-white/10 bg-white/5 text-white font-black uppercase text-[9px] tracking-[0.2em] hover:bg-elite-accent-cyan hover:text-black transition-all">
                <Link href={tile.href}>{tile.action || `Connect Terminal`}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
