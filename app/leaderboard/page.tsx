import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  quizzes: number;
  streak: number;
  avatar?: string;
}

export default async function LeaderboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/leaderboard`, {
    cache: 'no-store',
  });
  const entries: LeaderboardEntry[] = res.ok ? await res.json() : [];

  return (
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-teal-700">Performance Rankings</p>
            <h1 className="text-3xl font-semibold text-slate-900">Global Leaderboard</h1>
            <p className="text-slate-600 max-w-2xl">
              Track top performers across AdaptIQ. Rankings update in real-time as learners complete quizzes and earn mastery streaks.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="self-start md:self-auto px-6">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </header>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="text-3xl">🏆</span>
              Weekly Champions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-500">No leaderboard data available yet. Take quizzes to start climbing the ranks.</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex flex-col gap-4 rounded-2xl border p-4 transition-all md:flex-row md:items-center md:justify-between ${
                      entry.rank === 1
                        ? 'border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 shadow-lg'
                        : entry.rank <= 3
                        ? 'border-blue-200 bg-gradient-to-r from-blue-50 via-white to-purple-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-inner">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-slate-900">{entry.name}</h2>
                          {entry.streak > 0 && (
                            <Badge variant="outline" size="sm" className="border-amber-200 text-amber-600 bg-amber-50">
                              🔥 {entry.streak} day streak
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{entry.quizzes} quizzes completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{entry.score}%</div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Mastery Score</div>
                      </div>
                      <Badge variant={entry.rank <= 3 ? 'success' : 'default'} size="lg">
                        Rank {entry.rank}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
