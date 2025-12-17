'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'quiz' | 'streak' | 'mastery' | 'social';
}

interface AchievementsProps {
  achievements?: Achievement[]; // must be real data fetched from API/DB
}

export function Achievements({ achievements = [] }: AchievementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏅</span>
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!Array.isArray(achievements) || achievements.length === 0 ? (
          <p className="text-sm text-gray-500">No achievements yet. Complete quizzes to unlock achievements.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-75'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      {achievement.unlocked && (
                        <Badge variant="success" size="sm">Unlocked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>)}
      </CardContent>
    </Card>
  );
}
