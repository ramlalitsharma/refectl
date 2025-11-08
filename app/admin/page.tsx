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

    const activeUsers = new Set(progress.map((p: any) => p.userId)).size;

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
      name: 'Learner Management',
      description: 'Segment learners, manage cohorts, and monitor enrollments.',
      href: '/admin/users',
      icon: '👥',
      action: 'Manage learners',
      metric: `${stats.totalUsers} users`,
    },
    {
      name: 'Enrollment Ops',
      description: 'Process enrollment approvals, cohorts, and waitlists.',
      href: '/admin/enrollments',
      icon: '✅',
      action: 'Open enrollments',
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 backdrop-blur dark:bg-gray-800/80 sticky top-0 z-50">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Learner Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Curate every learning asset, manage learners, and orchestrate monetization from a unified studio suite.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Learners"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.activeUsers} active this week`}
            icon="👥"
            trend="↑"
          />
          <StatCard
            title="Courses"
            value={stats.totalCourses.toLocaleString()}
            subtitle={`${stats.publishedCourses} published`}
            icon="📚"
            trend="↑"
          />
          <StatCard
            title="Question Banks"
            value={stats.totalQuestionBanks.toLocaleString()}
            subtitle="Across subjects"
            icon="❓"
            trend="↑"
          />
          <StatCard
            title="Revenue (est)"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtitle="From premium plans"
            icon="💰"
            trend="↑"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Content Studios</h2>
            <Link href="/admin/studio">
              <Button variant="outline" size="sm">Browse all studios</Button>
            </Link>
          </div>
          <StudioGrid tiles={contentStudios} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Assessment & Exam Authoring</h2>
          <StudioGrid tiles={assessmentStudios} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Operations & Monetization</h2>
          <StudioGrid tiles={operationsTiles} columns="md:grid-cols-2 xl:grid-cols-3" />
        </section>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button asChild>
                <Link href="/admin/studio/courses">+ New Course</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/studio/questions">+ New Question Set</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/studio/exams">+ New Exam</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/studio/blogs">+ New Blog</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/users">Manage Learners</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StudioGrid({ tiles, columns = 'md:grid-cols-2 xl:grid-cols-3' }: { tiles: StudioTile[]; columns?: string }) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {tiles.map((tile) => (
        <Card key={tile.name} className="border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-start gap-3">
              <span className="text-3xl">{tile.icon}</span>
              <div>
                <div className="text-lg font-semibold text-slate-900">{tile.name}</div>
                <p className="text-sm text-slate-500">{tile.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tile.metric && <p className="text-xs text-slate-400">{tile.metric}</p>}
            <Button asChild>
              <Link href={tile.href}>{tile.action || `Open ${tile.name}`}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
