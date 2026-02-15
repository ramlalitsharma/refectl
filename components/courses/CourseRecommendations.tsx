'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
// Button retained if used elsewhere
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen } from 'lucide-react';

type RecCourse = {
  _id: string;
  slug: string;
  title: string;
  subject?: string;
  level?: string;
  modules?: { lessons?: unknown[] }[];
};

export function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState<RecCourse[]>([]);
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-40 w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-slate-600">No recommendations yet. Explore courses to personalize suggestions.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((course, idx) => (
            <FadeIn key={course._id} delay={idx * 0.1}>
              <ScaleOnHover>
                <Link href={`/courses/${course.slug}`}>
                  <div className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-white opacity-90" />
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white line-clamp-2 mb-1">
                      {course.title}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {course.subject || 'General'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                        {course.level || 'Beginner'}
                      </span>
                      <span>
                        {(course.modules?.reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0) || 0)} lessons
                      </span>
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
