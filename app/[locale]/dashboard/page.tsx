import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { syncUserToDatabase } from '@/lib/user-sync';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Achievements } from '@/components/achievements/Achievements';
import { Progress } from '@/components/ui/Progress';
import { headers } from 'next/headers';
import { FadeIn } from '@/components/ui/Motion';
import { getDatabase } from '@/lib/mongodb';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { getUserRole } from '@/lib/admin-check';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StudyStreak } from '@/components/dashboard/StudyStreak';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { StudyTimeChart } from '@/components/dashboard/StudyTimeChart';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { SubjectMasteryRadar } from '@/components/dashboard/SubjectMasteryRadar';
import { ChartColumn, Layers, Target, Zap } from 'lucide-react';
import { XPSystem } from '@/components/dashboard/XPSystem';
import { DailyQuests } from '@/components/dashboard/DailyQuests';
import { BadgeShowcase } from '@/components/dashboard/BadgeShowcase';
import { TieredLeaderboard } from '@/components/dashboard/TieredLeaderboard';
import { resolveBaseUrl } from '@/lib/brand';
import { SeasonalService } from '@/lib/seasonal-service';
import { SeasonalDashboard } from '@/components/gamification/SeasonalDashboard';
import { StreakCalendar } from '@/components/gamification/StreakCalendar';
import { differenceInDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  syncUserToDatabase().catch(console.error);

  const baseUrl = await resolveBaseUrl();
  const cookie = (await headers()).get('cookie') || '';
  const common = { cache: 'no-store' as const, headers: { cookie } };

  const [
    user,
    role,
    statsRes,
    leaderboardRes,
    achievementsRes,
    streakRes,
    db,
    seasonalProgress
  ] = await Promise.all([
    currentUser(),
    getUserRole(),
    fetch(`${baseUrl}/api/user/stats`, common),
    fetch(`${baseUrl}/api/leaderboard`, common),
    fetch(`${baseUrl}/api/achievements`, common),
    fetch(`${baseUrl}/api/user/stats/streak`, common),
    getDatabase(),
    SeasonalService.getUserProgress(userId)
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

  const seasonalChallenges = (seasonalProgress || []).map((p: any) => ({
    id: p.challenge.id,
    title: p.challenge.title,
    themeColor: p.challenge.themeColor,
    progressPercent: p.progressPercent,
    rewardBadgeId: p.challenge.rewardBadgeId,
    daysRemaining: Math.max(0, differenceInDays(new Date(p.challenge.endDate), new Date()))
  }));

  const recentActivityDisplay = recentActivity.map((a: any) => {
    const t = a.completedAt ?? a.updatedAt;
    const displayTime = t ? new Date(t).toLocaleDateString() : 'Recent';
    return { ...a, displayTime };
  });

  const displayCourses = (enrolledCourses as any[]).map((c) => ({
    _id: c._id,
    title: c.title,
    summary: c.summary,
    slug: c.slug,
  }));

  const gaps = (stats.knowledgeGaps || []) as any[];
  const mastery = (stats.mastery || []) as any[];

  const overallMastery = mastery.length
    ? Math.round(mastery.reduce((sum: number, m: any) => sum + (m.percent || 0), 0) / mastery.length)
    : 0;

  const lastCourseSlug = recentActivity.length > 0 ? displayCourses[0]?.slug : null;

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 bg-dot-grid selection:bg-elite-accent-cyan/30 pb-12 sm:pb-16 lg:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-10 sm:space-y-12 lg:space-y-16">
        {/* Elite Control Center Header */}
        <header className="space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-elite-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-elite-accent-cyan"></span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest text-elite-accent-cyan">Control Center Active</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
                  Welcome, <span className="text-gradient-cyan">{user?.firstName || user?.email?.split('@')[0] || 'Learner'}</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xl">
                  Your intelligence profile is syncronized. Current performance is <span className="text-white font-bold tracking-tight">+12% above benchmark</span>.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.3} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/courses" className="w-full sm:w-auto">
                <Button className="touch-target w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 sm:px-8 text-sm sm:text-base">
                  New Assessment
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="touch-target w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-elite-accent-cyan text-black hover:bg-white font-black px-6 sm:px-8 shadow-lg shadow-elite-accent-cyan/20 text-sm sm:text-base">
                  Continue Path
                </Button>
              </Link>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <EliteStat icon={<ChartColumn className="h-6 w-6" />} label="Knowledge Depth" value={`${overallMastery}%`} color="cyan" trend="+4.2%" />
              <EliteStat icon={<Zap className="h-6 w-6" />} label="Learning Momentum" value={currentStreak} color="purple" trend="Stable" />
              <EliteStat icon={<Target className="h-6 w-6" />} label="Skill Accuracy" value={`${Math.round(stats.averageScore || 0)}%`} color="emerald" trend="+2.1%" />
              <EliteStat icon={<Layers className="h-6 w-6" />} label="Intel Modules" value={stats.totalQuizzes || 0} color="blue" trend="+12" />
            </div>
          </FadeIn>
        </header>

        <QuickActions lastCourseSlug={lastCourseSlug} />

        {/* Global Intelligence Grid */}
        <section className="grid gap-6 sm:gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-6 sm:space-y-8">
            <div className="glass-card-premium p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 lg:mb-10">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest">Growth Heatmap</h2>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-wide sm:tracking-widest">Cumulative Activity Analysis</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-elite-accent-cyan animate-pulse" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-elite-accent-purple" />
                </div>
              </div>
              <ActivityHeatmap />
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="glass-card-premium p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-white/5">
                <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8">Temporal Map</h2>
                <StreakCalendar
                  activityDates={[]}
                  currentStreak={currentStreak}
                  longestStreak={stats.longestStreak || currentStreak}
                />
              </div>
              <StudyStreak />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="glass-card-premium p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-white/5 group">
              <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8 lg:mb-10">Skill Radar</h2>
              <SubjectMasteryRadar />
            </div>
            <SeasonalDashboard challenges={seasonalChallenges} />
          </div>
        </section>

        {/* Intelligence Feed & Optimization */}
        <section className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <div className="glass-card-premium p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-white/5">
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8">Intelligence Feed</h2>
            <div className="space-y-4">
              {recentActivityDisplay.length ? recentActivityDisplay.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-elite-accent-cyan/20 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{activity.completed ? '✅' : '🕒'}</span>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">{activity.subject || 'Analysis Module'}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                      {activity.completed ? `Verified: ${activity.score || 0}%` : 'Sync in progress'} • {activity.displayTime}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">No activity detected</div>
              )}
            </div>
          </div>

          <div className="glass-card-premium p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border-white/5">
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8">Optimization Gaps</h2>
            <div className="grid gap-4">
              {gaps.length ? gaps.slice(0, 4).map((gap, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-elite-accent-purple/5 border border-elite-accent-purple/10 hover:border-elite-accent-purple/30 transition-all">
                  <div className="font-bold text-elite-accent-purple mb-1 truncate uppercase">{gap.topic || 'Subject Delta'}</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural re-alignment recommended</div>
                </div>
              )) : (
                <div className="text-center py-12 text-emerald-500/50 font-black uppercase tracking-[0.3em] text-[10px]">Neural profile optimized</div>
              )}
            </div>
          </div>
        </section>

        {/* Peer Benchmarking */}
        <section className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <Leaderboard entries={leaderboard} />
          <Achievements achievements={achievements} />
        </section>

        {/* Data Telemetry */}
        <section className="space-y-8 sm:space-y-10 lg:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-elite-accent-cyan">Infrastructure</h2>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter">Performance Telemetry</h3>
            </div>
            <div className="flex gap-1.5 sm:gap-2 bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/5 overflow-x-auto">
              {['7D', '30D', 'ALL'].map(t => (
                <button key={t} className={`touch-target-sm px-4 sm:px-6 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black rounded-lg sm:rounded-xl transition-all whitespace-nowrap ${t === '7D' ? 'bg-elite-accent-cyan text-black' : 'text-slate-500 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <div className="glass-card-premium p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] border-white/5">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8 lg:mb-10 text-center">Mastery Trend Delta</h4>
              <ScoreTrendChart />
            </div>
            <div className="glass-card-premium p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] border-white/5">
              <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wide sm:tracking-widest mb-6 sm:mb-8 lg:mb-10 text-center">Temporal Allocation</h4>
              <StudyTimeChart />
            </div>
          </div>
        </section>

        {/* Motivational Utility */}
        <section className="space-y-8 sm:space-y-10 lg:space-y-12">
          <div className="space-y-1 sm:space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-elite-accent-purple">Incentives</h2>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter">Achievement Ledger</h3>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <XPSystem />
            <DailyQuests />
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <BadgeShowcase />
            <TieredLeaderboard />
          </div>
        </section>

        {/* Global Recommendations */}
        <section className="space-y-6 sm:space-y-8 lg:space-y-10">
          <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-elite-accent-cyan">Neural Mapping</h2>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter">Recommended Evolutions</h3>
          <CourseRecommendations />
        </section>
      </div>
    </div>
  );
}

function EliteStat({ icon, label, value, color, trend }: {
  icon: React.ReactNode,
  label: string,
  value: string | number,
  color: 'cyan' | 'purple' | 'emerald' | 'blue',
  trend?: string
}) {
  const colorMap = {
    cyan: "text-elite-accent-cyan border-elite-accent-cyan/20 bg-elite-accent-cyan/10",
    purple: "text-elite-accent-purple border-elite-accent-purple/20 bg-elite-accent-purple/10",
    emerald: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
    blue: "text-blue-400 border-blue-400/20 bg-blue-400/10",
  };

  return (
    <div className={`glass-card-premium p-8 rounded-[2rem] border ${colorMap[color]} group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full bg-black/40 border border-white/5 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-slate-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1 relative z-10">
        <div className="text-4xl font-black text-white tracking-tighter">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</div>
      </div>
    </div>
  );
}
