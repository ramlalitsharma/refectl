import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { syncUserToDatabase } from '@/lib/user-sync';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Achievements } from '@/components/achievements/Achievements';
import { Progress } from '@/components/ui/Progress';
import { StatCard } from '@/components/ui/StatCard';
import { headers } from 'next/headers';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';
import { getDatabase } from '@/lib/mongodb';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { getUserRole, isSuperAdmin } from '@/lib/admin-check';
import { ViewAsSwitcher } from '@/components/admin/ViewAsSwitcher';
import { CircularProgress } from '@/components/dashboard/CircularProgress';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { StudyTimeChart } from '@/components/dashboard/StudyTimeChart';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { SubjectMasteryRadar } from '@/components/dashboard/SubjectMasteryRadar';
import { XPSystem } from '@/components/dashboard/XPSystem';
import { DailyQuests } from '@/components/dashboard/DailyQuests';
import { BadgeShowcase } from '@/components/dashboard/BadgeShowcase';
import { TieredLeaderboard } from '@/components/dashboard/TieredLeaderboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fire-and-forget sync to avoid blocking render
  syncUserToDatabase().catch(console.error);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookie = (await headers()).get('cookie') || '';
  const common = { cache: 'no-store' as const, headers: { cookie } };

  // Parallelize EVERYTHING
  const [
    user,
    role,
    statsRes,
    leaderboardRes,
    achievementsRes,
    streakRes,
    db
  ] = await Promise.all([
    currentUser(),
    getUserRole(),
    fetch(`${baseUrl}/api/user/stats`, common),
    fetch(`${baseUrl}/api/leaderboard`, common),
    fetch(`${baseUrl}/api/achievements`, common),
    fetch(`${baseUrl}/api/user/stats/streak`, common),
    getDatabase()
  ]);

  const [enrolledCourses, recentActivity] = await Promise.all([
    db.collection('courses').find({ status: 'published' }).limit(6).toArray(),
    db.collection('userProgress').find({ userId }).sort({ completedAt: -1 }).limit(5).toArray()
  ]);

  const stats = statsRes.ok ? await statsRes.json() : { totalQuizzes: 0, averageScore: 0, knowledgeGaps: [], mastery: [] };
  const leaderboardData = leaderboardRes.ok ? await leaderboardRes.json() : null;
  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const achievementsData = achievementsRes.ok ? await achievementsRes.json() : null;
  const achievements = Array.isArray(achievementsData)
    ? achievementsData
    : (Array.isArray(achievementsData?.data) ? achievementsData.data : []);

  const streakData = streakRes.ok ? await streakRes.json() : null;
  const currentStreak = streakData?.data?.currentStreak ?? 0;

  const isSuperAdminUser = role === 'superadmin';

  const recentActivityDisplay = recentActivity.map((a: Record<string, unknown>) => {
    const t1 = a['completedAt'] as unknown;
    const t2 = a['updatedAt'] as unknown;
    const t = (t1 ?? t2) as unknown;
    const displayTime = t instanceof Date ? t.toISOString() : typeof t === 'string' ? t : '';
    return { ...a, displayTime } as Record<string, unknown> & { displayTime: string };
  });

  type ActivityDisplay = { completed?: boolean; subject?: string; score?: number; displayTime: string };
  const activities: ActivityDisplay[] = recentActivityDisplay.map((a) => ({
    completed: typeof a.completed === 'boolean' ? a.completed : undefined,
    subject: typeof a.subject === 'string' ? a.subject : undefined,
    score: typeof a.score === 'number' ? a.score : undefined,
    displayTime: a.displayTime,
  }));

  type CourseLite = { _id: unknown; title: string; summary?: string; slug: string };
  const displayCourses: CourseLite[] = (enrolledCourses as unknown[]).map((c) => {
    const obj = c as Record<string, unknown>;
    return {
      _id: obj['_id'],
      title: String(obj['title'] || ''),
      summary: obj['summary'] ? String(obj['summary']) : undefined,
      slug: String(obj['slug'] || ''),
    } satisfies CourseLite;
  });

  type Gap = { topic?: string };
  const gaps: Gap[] = (stats.knowledgeGaps || []) as Gap[];

  type MasteryItem = { subject?: string; percent?: number };
  const mastery: MasteryItem[] = (stats.mastery || []) as MasteryItem[];
  const colors: ('blue' | 'green' | 'purple' | 'orange')[] = ['blue', 'green', 'purple', 'orange'];

  const overallMastery = mastery.length
    ? Math.round(mastery.reduce((sum, m) => sum + (m.percent || 0), 0) / mastery.length)
    : 0;

  // Get last course for quick resume
  const lastCourseSlug = recentActivity.length > 0 ? displayCourses[0]?.slug : null;

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-10 space-y-10">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)] items-center">
          <Card className="border-none shadow-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white">
            <CardContent className="space-y-4 p-8">
              <div className="text-sm uppercase tracking-wide text-white/80">Welcome back</div>
              <h1 className="text-3xl font-semibold">Hi {user?.firstName || user?.email || 'Learner'}, your learning journey continues.</h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Keep building momentum with adaptive quizzes, guided tracks, and real-time insights tailored to your goals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/subjects"><Button variant="inverse" className="px-6">Browse Subjects</Button></Link>
                <Link href="/courses"><Button variant="outline" className="border-white text-white">Explore Courses</Button></Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
              <StatCard title="Total Quizzes" value={stats.totalQuizzes || 0} subtitle="Completed" icon="📝" color="blue" trend="+8%" />
              <StatCard title="Average Score" value={`${Math.round(stats.averageScore || 0)}%`} subtitle="Mastery Level" icon="📈" color="green" trend="+3%" />
              <StatCard title="Knowledge Gaps" value={(stats.knowledgeGaps || []).length} subtitle="Focus Areas" icon="🧩" color="orange" />
              <StatCard title="Overall Mastery" value={`${overallMastery}%`} subtitle="Across subjects" icon="🎯" color="purple" />
            </CardContent>
          </Card>
        </header>

        {/* Study Streak Section - Now uses real API data */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,2fr)]">
          <StudyStreak />

          <Card className="border-none shadow-lg backdrop-blur-sm bg-white/80">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Progress Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <CircularProgress value={overallMastery} color="teal" size={100} strokeWidth={10} />
                  <div className="text-sm font-medium text-slate-700">Overall Mastery</div>
                </div>
                <div className="text-center space-y-2">
                  <CircularProgress
                    value={stats.totalQuizzes > 0 ? Math.min(100, (stats.totalQuizzes / 50) * 100) : 0}
                    color="blue"
                    size={100}
                    strokeWidth={10}
                  />
                  <div className="text-sm font-medium text-slate-700">{stats.totalQuizzes} Quizzes</div>
                </div>
                <div className="text-center space-y-2">
                  <CircularProgress
                    value={stats.averageScore || 0}
                    color="green"
                    size={100}
                    strokeWidth={10}
                  />
                  <div className="text-sm font-medium text-slate-700">Avg. Score</div>
                </div>
                <div className="text-center space-y-2">
                  <CircularProgress
                    value={achievements.length > 0 ? Math.min(100, (achievements.length / 20) * 100) : 0}
                    color="purple"
                    size={100}
                    strokeWidth={10}
                  />
                  <div className="text-sm font-medium text-slate-700">{achievements.length} Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Section */}
        <QuickActions lastCourseSlug={lastCourseSlug} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Continue Learning</h2>
            <Link href="/my-learning"><Button variant="outline" className="px-6">View All</Button></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayCourses.slice(0, 3).map((course) => (
              <Card key={String(course._id)} className="shadow-lg border-none backdrop-blur-sm bg-white/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-teal-600 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{course.summary || 'Continue where you left off and complete the remaining lessons to unlock your certificate.'}</p>
                  <Button className="w-full group-hover:bg-teal-600 transition-colors" asChild>
                    <Link href={`/courses/${course.slug}`}>Resume Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {enrolledCourses.length === 0 && (
              <Card className="shadow-md border-none backdrop-blur-sm bg-gradient-to-br from-slate-50 to to-blue-50">
                <CardContent className="p-6 text-sm text-slate-600">
                  You haven&apos;t enrolled in any courses yet. Browse trending courses to start learning.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
          <div className="space-y-6">
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.length ? activities.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                    <span className="text-2xl">{activity.completed ? '✅' : '📝'}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{activity.subject || 'General Quiz'}</div>
                      <div className="text-xs text-slate-500">
                        {activity.completed ? `Completed with ${activity.score || 0}%` : 'In progress'} • {activity.displayTime}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No recent quiz activity. Try a new subject to see it here.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700">Knowledge Gaps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gaps.slice(0, 4).map((gap, idx) => (
                  <div key={idx} className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-3 hover:shadow-md transition-shadow duration-200">
                    <div className="font-semibold text-amber-800">{gap.topic || 'Focus area'}</div>
                    <div className="text-xs text-amber-700">Revise this topic to improve your mastery.</div>
                  </div>
                ))}
                {(!stats.knowledgeGaps || stats.knowledgeGaps.length === 0) && (
                  <p className="text-sm text-slate-500">No major gaps detected. Keep up the great work!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Leaderboard entries={leaderboard} />
            <Achievements achievements={achievements} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Recommended For You</h2>
          <CourseRecommendations />
        </section>

        {/* Analytics Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">📊 Learning Analytics</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors">
                7 Days
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                30 Days
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                All Time
              </button>
            </div>
          </div>

          {/* Top Row: Score Trend & Study Time */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreTrendChart />
            <StudyTimeChart />
          </div>

          {/* Second Row: Activity Heatmap & Subject Radar */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
            <ActivityHeatmap />
            <SubjectMasteryRadar />
          </div>
        </section>

        {/* Gamification Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">🎮 Rewards & Achievements</h2>

          {/* Top Row: XP System & Daily Quests */}
          <div className="grid gap-6 lg:grid-cols-2">
            <XPSystem />
            <DailyQuests />
          </div>

          {/* Bottom Row: Badge Showcase & Tiered Leaderboard */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BadgeShowcase />
            <TieredLeaderboard />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Mastery Progress</h2>
          <Card className="shadow-md border-none">
            <CardContent className="space-y-4 p-6">
              {mastery.length ? (
                mastery.slice(0, 6).map((m, idx) => (
                  <div key={m.subject || String(idx)}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{m.subject || 'Subject'}</span>
                      <span className="text-slate-500">{m.percent || 0}%</span>
                    </div>
                    <Progress value={m.percent || 0} color={colors[idx % colors.length]} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Complete quizzes to unlock detailed mastery analytics.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-sm">
        <div className="grid grid-cols-4 text-sm">
          <Link href="/subjects" className="flex items-center justify-center gap-1 py-3">
            <span>📚</span>
            <span>Subjects</span>
          </Link>
          <Link href="/courses" className="flex items-center justify-center gap-1 py-3">
            <span>🎓</span>
            <span>Courses</span>
          </Link>
          <Link href="/live" className="flex items-center justify-center gap-1 py-3">
            <span>📺</span>
            <span>Live</span>
          </Link>
          <Link href="/dashboard" className="flex items-center justify-center gap-1 py-3">
            <span>🏠</span>
            <span>Home</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
