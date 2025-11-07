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

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await syncUserToDatabase();
  const user = await currentUser();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookie = (await headers()).get('cookie') || '';
  const common = { cache: 'no-store' as const, headers: { cookie } };
  const [statsRes, leaderboardRes, achievementsRes] = await Promise.all([
    fetch(`${baseUrl}/api/user/stats`, common),
    fetch(`${baseUrl}/api/leaderboard`, common),
    fetch(`${baseUrl}/api/achievements`, common),
  ]);
  const stats = statsRes.ok ? await statsRes.json() : { totalQuizzes: 0, averageScore: 0, knowledgeGaps: [], mastery: [] };
  const leaderboard = leaderboardRes.ok ? await leaderboardRes.json() : [];
  const achievements = achievementsRes.ok ? await achievementsRes.json() : [];

  const db = await getDatabase();
  const enrolledCourses = await db
    .collection('courses')
    .find({ status: 'published' })
    .limit(6)
    .toArray();

  const recentActivity = await db
    .collection('userProgress')
    .find({ userId })
    .sort({ completedAt: -1 })
    .limit(5)
    .toArray();

  const overallMastery = stats.mastery?.length
    ? Math.round(stats.mastery.reduce((sum: number, m: any) => sum + (m.percent || 0), 0) / stats.mastery.length)
    : 0;

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
                <Link href="/subjects"><Button className="bg-white text-teal-600">Browse Subjects</Button></Link>
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

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Continue Learning</h2>
            <Link href="/my-learning"><Button variant="outline" className="px-6">View All</Button></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.slice(0, 3).map((course: any) => (
              <Card key={course._id} className="shadow-md border-none">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{course.summary || 'Continue where you left off and complete the remaining lessons to unlock your certificate.'}</p>
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${course.slug}`}>Resume Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {enrolledCourses.length === 0 && (
              <Card className="shadow-md border-none">
                <CardContent className="p-6 text-sm text-slate-600">
                  You haven&apos;t enrolled in any courses yet. Browse trending courses to start learning.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
          <div className="space-y-6">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.length ? recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-2xl">{activity.completed ? '✅' : '📝'}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{activity.subject || 'General Quiz'}</div>
                      <div className="text-xs text-slate-500">
                        {activity.completed ? `Completed with ${activity.score || 0}%` : 'In progress'} • {new Date(activity.completedAt || activity.updatedAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">No recent quiz activity. Try a new subject to see it here.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700">Knowledge Gaps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(stats.knowledgeGaps || []).slice(0, 4).map((gap: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
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

        <section className="space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Mastery Progress</h2>
          <Card className="shadow-md border-none">
            <CardContent className="space-y-4 p-6">
              {(stats.mastery || []).length ? (
                stats.mastery.slice(0, 6).map((m: any, idx: number) => (
                  <div key={m.subject || idx}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{m.subject || 'Subject'}</span>
                      <span className="text-slate-500">{m.percent || 0}%</span>
                    </div>
                    <Progress value={m.percent || 0} color={['teal', 'emerald', 'blue', 'purple'][idx % 4] as any} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Complete quizzes to unlock detailed mastery analytics.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
