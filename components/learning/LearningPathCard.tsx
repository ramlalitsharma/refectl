'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/AnimatedCard';

interface LearningPathCardProps {
  path: {
    id: string;
    title: string;
    description?: string;
    courses: Array<{ courseId: string; order: number; isRequired: boolean }>;
    estimatedDuration?: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    enrolledCount: number;
    progress?: number;
  };
  showProgress?: boolean;
}

export function LearningPathCard({ path, showProgress = false }: LearningPathCardProps) {
  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
  };

  return (
    <AnimatedCard hover>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{path.title}</CardTitle>
            <Badge className={difficultyColors[path.difficulty]}>
              {path.difficulty}
            </Badge>
          </div>
          {path.description && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{path.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{path.courses.length} {path.courses.length === 1 ? 'course' : 'courses'}</span>
            {path.estimatedDuration && (
              <>
                <span>•</span>
                <span>{path.estimatedDuration}h</span>
              </>
            )}
            <span>•</span>
            <span>{path.enrolledCount} enrolled</span>
          </div>

          {showProgress && path.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium">{Math.round(path.progress)}%</span>
              </div>
              <Progress value={path.progress} />
            </div>
          )}

          {path.tags && path.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {path.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="info" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Link href={`/learning-paths/${path.id}`}>
            <Button variant="inverse" className="w-full">
              {showProgress ? 'Continue Learning' : 'View Path'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

