'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  quizzes: number;
  streak: number;
  avatar?: string;
}

interface LeaderboardProps {
  entries?: LeaderboardEntry[]; // must be real data fetched from API/DB
}

export function Leaderboard({ entries = [] }: LeaderboardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No leaderboard data yet. Start taking quizzes to appear here.</p>
        ) : (
          <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`text-2xl font-bold w-10 text-center ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{entry.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                    <span>{entry.quizzes} quizzes</span>
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1">
                        🔥 {entry.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{entry.score}%</div>
                <Badge variant={entry.rank <= 3 ? 'success' : 'default'} size="sm">
                  Rank {entry.rank}
                </Badge>
              </div>
            </div>
          ))}
        </div>)}
        <div className="mt-4 text-center">
          <Link href="/leaderboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Full Leaderboard →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
