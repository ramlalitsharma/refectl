import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { CourseCreatorStudio } from '@/components/admin/CourseCreatorStudio';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{ slug?: string } | undefined>;
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
    createdAt: course.createdAt,
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
        createdAt: createdAt ? createdAt.toISOString() : undefined,
        updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
        workflowUpdatedAt: workflowUpdatedAt ? workflowUpdatedAt.toISOString() : undefined,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Course Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Architect adaptive learning programs with AI acceleration, manual module controls, and version-aware publishing.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <CourseCreatorStudio recentCourses={formatted} selectedCourse={selectedCourseData || undefined} />
      </main>
    </div>
  );
}
