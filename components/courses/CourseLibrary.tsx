'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: any[];
  createdAt?: string;
  icon?: string;
}

interface CourseLibraryProps {
  courses: Course[];
}

export function CourseLibrary({ courses: initialCourses }: CourseLibraryProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookmarked(new Set(data.map((b: any) => b.courseId)));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let filtered = [...initialCourses];

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.summary?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter((c) => c.subject === filterSubject);
    }

    if (filterLevel) {
      filtered = filtered.filter((c) => c.level === filterLevel);
    }

    setCourses(filtered);
  }, [search, filterSubject, filterLevel, initialCourses]);

  const subjects = useMemo(
    () => Array.from(new Set(initialCourses.map((c) => c.subject).filter(Boolean))) as string[],
    [initialCourses]
  );
  const levels = ['basic', 'intermediate', 'advanced'];

  const toggleBookmark = async (course: Course) => {
    const courseId = course._id || course.slug;
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
        }),
      });
      const data = await res.json();
      if (data.bookmarked !== undefined) {
        setBookmarked((prev) => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(courseId);
          } else {
            next.delete(courseId);
          }
          return next;
        });
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  return (
    <div className="space-y-10">
      <Card className="border border-slate-200 bg-white/90 shadow-xl">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Smart filters</h3>
              <p className="text-sm text-slate-500">Search across {initialCourses.length} courses with instant filtering.</p>
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              {courses.length} match{courses.length === 1 ? '' : 'es'}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),minmax(0,0.5fr),minmax(0,0.5fr)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card className="border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-5xl">🔍</span>
            <h3 className="text-xl font-semibold">No courses found</h3>
            <p className="text-sm text-white/70">
              Try adjusting your search keywords or selecting different filters to discover more courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, idx) => {
            const courseId = course._id || course.slug;
            const isBookmarked = bookmarked.has(courseId);
            const lessonCount = course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0;

            return (
              <FadeIn key={course.slug} delay={idx * 0.05}>
                <ScaleOnHover>
                  <Card className="group flex h-full flex-col overflow-hidden border-none bg-white shadow-lg ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-2xl">
                    <div className="relative h-40 w-full bg-gradient-to-br from-indigo-500 via-teal-500 to-emerald-500">
                      <div className="absolute inset-0 flex items-center justify-center text-5xl text-white/90">
                        {course.icon || '📘'}
                      </div>
                      <button
                        onClick={() => toggleBookmark(course)}
                        className="absolute right-4 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-teal-600 shadow-md transition hover:bg-white"
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
                      >
                        {isBookmarked ? 'Saved ★' : 'Save ☆'}
                      </button>
                    </div>

                    <CardHeader className="flex-1 space-y-3">
                      <CardTitle className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-teal-600">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {course.summary || 'Adaptive course with dynamic modules and assessments.'}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          {course.subject || 'General'}
                        </span>
                        {course.level && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                            {course.level}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                          {lessonCount} lessons
                        </span>
                      </div>

                      <Button variant="inverse" className="w-full" asChild>
                        <Link href={`/courses/${course.slug}`}>View Course</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}

