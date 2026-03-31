import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { CourseCreatorStudio } from '@/components/admin/CourseCreatorStudio';
import { Target, Zap } from 'lucide-react';
import { FadeIn } from '@/components/ui/Motion';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{ slug?: string } | undefined>;
}

function toIsoDateString(value: unknown): string | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  if (typeof value === 'object' && value !== null && 'toISOString' in value && typeof (value as { toISOString?: unknown }).toISOString === 'function') {
    try {
      return (value as { toISOString: () => string }).toISOString();
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export default async function CourseStudioPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();

  const courses = await db
    .collection('courses')
    .find({}, { projection: { title: 1, status: 1, level: 1, createdAt: 1, slug: 1 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  const formatted = courses.map((course: any) => ({
    id: course._id ? String(course._id) : course.slug,
    slug: course.slug,
    title: course.title,
    status: course.status || 'draft',
    level: course.level,
    createdAt: toIsoDateString(course.createdAt),
  }));

  const params = searchParams ? await searchParams : undefined;
  const selectedSlug = params?.slug;
  let selectedCourseData: any = null;

  if (selectedSlug) {
    const selectedCourse = await db.collection('courses').findOne({ slug: selectedSlug });
    if (selectedCourse) {
      const {
        _id,
        createdAt,
        updatedAt,
        workflowUpdatedAt,
        workflowUpdatedBy,
        modules = [],
        resources = [],
        tags = [],
        metadata = {},
        price = null,
        seo = {},
        ...rest
      } = selectedCourse;

      selectedCourseData = {
        id: _id ? String(_id) : selectedCourse.slug,
        slug: selectedCourse.slug,
        ...rest,
        tags: Array.isArray(tags) ? tags : [],
        metadata,
        price,
        seo,
        createdAt: toIsoDateString(createdAt),
        updatedAt: toIsoDateString(updatedAt),
        workflowUpdatedAt: toIsoDateString(workflowUpdatedAt),
        workflowUpdatedBy: workflowUpdatedBy || undefined,
        modules: modules.map((module: any) => ({
          title: module.title,
          lessons: Array.isArray(module.lessons)
            ? module.lessons.map((lesson: any) => ({
              title: lesson.title,
              content: lesson.content,
            }))
            : [],
        })),
        resources: resources.map((resource: any) => ({
          type: resource.type,
          label: resource.label,
          url: resource.url,
        })),
      };
    }
  }

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 selection:bg-elite-accent-cyan/30">
      <header className="sticky top-0 z-50 glass-card-premium border-b border-white/5 px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 backdrop-blur-xl">
                <Target size={12} className="text-elite-accent-cyan" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan">Architecture Terminal</span>
              </div>
            </FadeIn>
            <div className="space-y-1">
              <FadeIn delay={0.1}>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                  Course <span className="text-gradient-cyan">Architect</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mt-2 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-slate-800" /> Neural Curriculum Engine v2.0
                </p>
              </FadeIn>
            </div>
          </div>

          <FadeIn delay={0.3}>
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-cyan/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-elite-accent-cyan/10 flex items-center justify-center text-elite-accent-cyan">
                <Zap size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Active Relay</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter transition-colors group-hover:text-slate-400">Node Synchronized</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-12">
        <FadeIn delay={0.4}>
          <CourseCreatorStudio recentCourses={formatted} selectedCourse={selectedCourseData || undefined} />
        </FadeIn>
      </main>
    </div>
  );
}
