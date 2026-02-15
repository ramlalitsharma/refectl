import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { BookOpen, ChartColumn, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  let stats: any = { cohorts: [], mastery: [], questionStats: [] };
  try {
    const db = await getDatabase();
    const progress = await db.collection('userProgress').find({ userId }).sort({ completedAt: -1 }).limit(100).toArray();

    // Cohort analysis: group by week/month
    const cohorts: Record<string, { count: number; avgScore: number }> = {};
    progress.forEach((p: any) => {
      const date = new Date(p.completedAt || p.createdAt);
      const week = `${date.getFullYear()}-W${Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
      if (!cohorts[week]) cohorts[week] = { count: 0, avgScore: 0 };
      cohorts[week].count++;
      cohorts[week].avgScore = (cohorts[week].avgScore * (cohorts[week].count - 1) + (p.score || 0)) / cohorts[week].count;
    });
    stats.cohorts = Object.entries(cohorts).slice(0, 12).map(([period, data]: [string, any]) => ({ period, ...data }));

    // Mastery by subject
    const mastery: Record<string, { total: number; correct: number }> = {};
    progress.forEach((p: any) => {
      const subject = p.subject || 'General';
      if (!mastery[subject]) mastery[subject] = { total: 0, correct: 0 };
      mastery[subject].total++;
      if (p.score >= 70) mastery[subject].correct++;
    });
    stats.mastery = Object.entries(mastery).map(([subject, data]: [string, any]) => ({
      subject,
      percent: Math.round((data.correct / data.total) * 100),
    })).sort((a, b) => b.percent - a.percent);

    // Question difficulty stats
    const qStats: Record<string, { attempts: number; correct: number }> = {};
    progress.forEach((p: any) => {
      (p.answers || []).forEach((a: any) => {
        const key = a.difficulty || 'medium';
        if (!qStats[key]) qStats[key] = { attempts: 0, correct: 0 };
        qStats[key].attempts++;
        if (a.correct) qStats[key].correct++;
      });
    });
    stats.questionStats = Object.entries(qStats).map(([difficulty, data]: [string, any]) => ({
      difficulty,
      accuracy: Math.round((data.correct / data.attempts) * 100),
      attempts: data.attempts,
    }));
  } catch (e) {
    console.error('Analytics fetch error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Insights</h1>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Quizzes" value={stats.cohorts.reduce((n: number, c: any) => n + c.count, 0)} subtitle="Completed" icon={<ChartColumn className="h-8 w-8" />} color="blue" />
          <StatCard title="Avg Score" value={`${Math.round(stats.cohorts.reduce((s: number, c: any) => s + c.avgScore, 0) / (stats.cohorts.length || 1))}%`} subtitle="Overall" icon={<TrendingUp className="h-8 w-8" />} color="green" />
          <StatCard title="Subjects" value={stats.mastery.length} subtitle="Tracked" icon={<BookOpen className="h-8 w-8" />} color="purple" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.cohorts.length === 0 ? (
                <p className="text-sm text-gray-500">No cohort data yet. Complete quizzes to see trends.</p>
              ) : (
                <div className="space-y-4">
                  {stats.cohorts.map((c: any) => (
                    <div key={c.period}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{c.period}</span>
                        <span className="text-sm text-gray-500">{c.count} quizzes • {Math.round(c.avgScore)}% avg</span>
                      </div>
                      <Progress value={c.avgScore} color="blue" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mastery by Subject</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.mastery.length === 0 ? (
                <p className="text-sm text-gray-500">No mastery data yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.mastery.slice(0, 8).map((m: any, idx: number) => (
                    <div key={m.subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{m.subject}</span>
                        <span className="text-sm text-gray-500">{m.percent}%</span>
                      </div>
                      <Progress value={m.percent} color={idx % 2 === 0 ? 'green' : 'purple'} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Difficulty Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.questionStats.length === 0 ? (
              <p className="text-sm text-gray-500">No question stats yet.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {stats.questionStats.map((q: any) => (
                  <div key={q.difficulty} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 capitalize mb-1">{q.difficulty}</div>
                    <div className="text-2xl font-bold text-gray-900">{q.accuracy}%</div>
                    <div className="text-xs text-gray-500">{q.attempts} attempts</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
