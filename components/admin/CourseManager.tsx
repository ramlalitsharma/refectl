'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkflowControls } from '@/components/admin/WorkflowControls';

interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  status?: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: { lessons?: any[] }[];
  updatedAt?: string;
  createdAt?: string;
}

interface CourseManagerProps {
  courses: CourseSummary[];
}

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'in_review', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
];

export function CourseManager({ courses }: CourseManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesStatus = statusFilter === 'all' ? true : (course.status || 'draft') === statusFilter;
      const haystack = `${course.title} ${course.summary || ''} ${course.subject || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [courses, statusFilter, search]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((course) => {
      const key = course.status || 'draft';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [courses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Courses ({courses.length})</h2>
          <p className="text-sm text-slate-500">Search, filter, and manage course lifecycle from one place.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, summary, or subject"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.key === 'all' ? courses.length : totals.get(filter.key) || 0;
          return (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? 'inverse' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
              <span className="ml-2 rounded-full bg-slate-200 px-2 text-xs text-slate-600">{count}</span>
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-slate-500">No courses match the current filters.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseSummary }) {
  const [courseStatus, setCourseStatus] = useState(course.status || 'draft');
  const lessons = useMemo(() => {
    return (course.modules || []).reduce((total, module) => total + (module.lessons?.length || 0), 0);
  }, [course.modules]);

  return (
    <Card className="h-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-video rounded-t-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500" />
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-900">{course.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Badge variant={courseStatus === 'published' ? 'success' : courseStatus === 'in_review' ? 'info' : 'default'}>{courseStatus}</Badge>
          {course.subject && <Badge variant="info">{course.subject}</Badge>}
          {course.level && <Badge variant="info">{course.level}</Badge>}
          <span>{lessons} lessons</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-3">{course.summary || 'No summary provided.'}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/courses/${course.slug}`}>View</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/admin/studio/courses?slug=${course.slug}`}>Manage</Link>
          </Button>
        </div>
        <WorkflowControls
          contentType="course"
          contentId={course.slug}
          status={courseStatus}
          updatedAt={course.updatedAt}
          onStatusChange={setCourseStatus}
        />
      </CardContent>
    </Card>
  );
}
