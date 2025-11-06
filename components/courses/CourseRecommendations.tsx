'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

export function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses/recommendations')
      .then(r => r.json())
      .then(data => {
        setRecommendations(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((course: any, idx: number) => (
            <FadeIn key={course._id} delay={idx * 0.1}>
              <ScaleOnHover>
                <Link href={`/courses/${course.slug}`}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-4xl text-white opacity-90">📚</span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0} lessons
                    </div>
                  </div>
                </Link>
              </ScaleOnHover>
            </FadeIn>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

