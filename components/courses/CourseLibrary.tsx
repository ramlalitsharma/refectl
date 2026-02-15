'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';
import { BookOpen, Crown } from 'lucide-react';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: Array<{ id?: string; title?: string; lessons?: unknown[] }>;
  createdAt?: string;
  icon?: string;
  price?: number;
  currency?: string;
  isPaid?: boolean;
  paymentType?: 'free' | 'paid' | 'premium';
}

interface CourseLibraryProps {
  courses: Course[];
  initialEnrollmentStatuses?: Record<string, string>;
  isAuthenticated?: boolean;
  isProUser?: boolean; // Added for revenue gating
}

export function CourseLibrary({
  courses: initialCourses,
  initialEnrollmentStatuses = {},
  isAuthenticated = false,
  isProUser: initialIsPro = false,
}: CourseLibraryProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPro, setIsPro] = useState(initialIsPro);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [enrollmentStatuses, setEnrollmentStatuses] = useState(initialEnrollmentStatuses);
  const [requestingCourse, setRequestingCourse] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = (data as Array<{ courseId: string }>).map((b) => b.courseId);
          setBookmarked(new Set(ids));
        }
      })
      .catch(() => undefined);

    // Fetch pro status if not provided
    if (!initialIsPro && isAuthenticated) {
      fetch('/api/admin/status')
        .then(r => r.json())
        .then(data => setIsPro(Boolean(data.isPro)))
        .catch(() => setIsPro(false));
    }
  }, [initialIsPro, isAuthenticated]);

  useEffect(() => {
    setEnrollmentStatuses(initialEnrollmentStatuses);
  }, [initialEnrollmentStatuses]);

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

  const enroll = async (course: Course) => {
    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/courses')}`;
      return;
    }

    // Revenue Gating: Redirect to pricing if non-pro trying to enroll in premium course
    if (course.isPaid && course.price && course.price > 0 && !isPro) {
      window.location.href = `/checkout?courseId=${course._id}&courseSlug=${course.slug}&amount=${course.price}`;
      return;
    }

    if (course.isPremium && !isPro) {
      window.location.href = '/pricing';
      return;
    }

    const courseId = course._id || course.slug;
    setRequestingCourse(courseId);
    try {
      const res = await fetch('/api/enrollments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to request enrollment');
      }
      if (data.status) {
        setEnrollmentStatuses((prev) => ({ ...prev, [courseId]: data.status }));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Enrollment request error:', error);
      alert(msg || 'Could not submit enrollment request');
    } finally {
      setRequestingCourse(null);
    }
  };

  return (
    <div className="space-y-12">
      <FadeIn delay={0.2}>
        <div className="relative rounded-[32px] overflow-hidden border border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <CardContent className="space-y-6 p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Intelligence Discovery</h3>
                <p className="text-sm text-slate-500 font-medium">Deep-search through {initialCourses.length} high-fidelity courses.</p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                {courses.length} match{courses.length === 1 ? '' : 'es'}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),minmax(0,0.5fr),minmax(0,0.5fr)]">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search your future skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/60 bg-white/50 dark:bg-slate-800/50 px-5 py-4 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
              </div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="rounded-2xl border border-slate-200/60 bg-white/50 dark:bg-slate-800/50 px-5 py-4 text-sm text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="rounded-2xl border border-slate-200/60 bg-white/50 dark:bg-slate-800/50 px-5 py-4 text-sm text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </div>
      </FadeIn>

      {courses.length === 0 ? (
        <FadeIn>
          <div className="relative rounded-[40px] overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 py-20 text-center shadow-xl">
            <div className="absolute inset-0 bg-mesh opacity-30" />
            <div className="relative z-10 space-y-4">
              <span className="text-6xl block mb-6 animate-bounce">🔭</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Coordinate Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                We couldn't locate any courses matching your specific search parameters. Try broad criteria.
              </p>
              <Button variant="outline" className="rounded-2xl mt-4" onClick={() => { setSearch(''); setFilterSubject(''); setFilterLevel(''); }}>Reset Filters</Button>
            </div>
          </div>
        </FadeIn>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, idx) => {
            const courseId = course._id || course.slug;
            const isBookmarked = bookmarked.has(courseId);
            const enrollmentStatus = enrollmentStatuses[courseId];

            const statusLabel =
              enrollmentStatus === 'approved'
                ? 'Enrolled'
                : enrollmentStatus === 'completed'
                  ? 'Completed'
                  : enrollmentStatus === 'pending'
                    ? 'Awaiting Access'
                    : null;

            const isNew = course.createdAt && (new Date().getTime() - new Date(course.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000);

            return (
              <FadeIn key={courseId} delay={idx * 0.05}>
                <ScaleOnHover>
                  <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 transition-all hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <div className="absolute inset-0 bg-mesh scale-150 group-hover:scale-100 transition-transform duration-1000 opacity-40" />
                      <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-700 opacity-30 blur-[2px] group-hover:blur-0">
                        {course.icon ? course.icon : <BookOpen className="h-14 w-14 text-white/80" />}
                      </div>

                      {statusLabel && (
                        <div className="absolute left-4 top-4 z-10">
                          <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-2xl border ${enrollmentStatus === 'approved' || enrollmentStatus === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            {statusLabel}
                          </span>
                        </div>
                      )}

                      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 items-end">
                        {(course as any).isPremium && (
                          <span className="rounded-full bg-indigo-600 px-4 py-2 text-[10px] font-black text-white shadow-xl shadow-indigo-600/20 uppercase tracking-[0.15em] border border-indigo-500/30">
                            <span className="inline-flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Premium
                            </span>
                          </span>
                        )}
                        {isNew && (
                          <span className="rounded-full bg-white dark:bg-slate-800 px-4 py-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 shadow-xl uppercase tracking-[0.15em] border border-slate-100 dark:border-white/5">
                            Elite Access
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.preventDefault(); toggleBookmark(course); }}
                        className={`absolute bottom-4 right-4 z-10 h-10 w-10 items-center justify-center rounded-2xl backdrop-blur-xl shadow-2xl transition-all ${isBookmarked ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-indigo-600'
                          } hidden group-hover:flex`}
                      >
                        {isBookmarked ? '★' : '☆'}
                      </button>
                    </div>

                    <CardContent className="flex flex-1 flex-col p-8">
                      <div className="mb-4">
                        <Link href={`/courses/${course.slug}`}>
                          <h4 className="text-xl font-black leading-tight text-slate-950 dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight">
                            {course.title}
                          </h4>
                        </Link>
                      </div>

                      {course.summary && (
                        <p className="mb-6 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold opacity-80">
                          {course.summary}
                        </p>
                      )}

                      <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">
                              {course.subject || 'General Discipline'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">Verified Content</span>
                              <div className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="text-xs font-bold text-slate-400">{course.modules?.length || 0} Modules</span>
                            </div>
                            {course.price && course.price > 0 ? (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-teal-600 dark:text-teal-400">Invest:</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {course.currency || 'USD'} {course.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">Access:</span>
                                <span className="text-sm font-black text-emerald-600">FREE</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {isAuthenticated && (enrollmentStatus === 'approved' || enrollmentStatus === 'completed') ? (
                              <Link href={`/courses/${course.slug}`} className="group/btn flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm">
                                <span className="text-xl">→</span>
                              </Link>
                            ) : (
                              <Button
                                className="h-12 rounded-2xl px-6 font-black shadow-lg shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white border-none transition-all active:scale-95"
                                onClick={() => enroll(course)}
                                disabled={requestingCourse === courseId}
                              >
                                {requestingCourse === courseId ? '...' : 'Enroll'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
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


