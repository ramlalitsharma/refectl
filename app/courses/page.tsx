import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { CourseLibrary } from '@/components/courses/CourseLibrary';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function CoursesIndexPage() {
  let courses: any[] = [];

  try {
    const db = await getDatabase();
    courses = await db
      .collection('courses')
      .find({ status: { $ne: 'draft' } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
  } catch (e) {
    courses = [];
  }

  const subjects = Array.from(new Set(courses.map((course) => course.subject).filter(Boolean)));
  const totalLessons = courses.reduce((sum, course) => {
    return (
      sum +
      (course.modules?.reduce((count: number, module: any) => count + (module.lessons?.length || 0), 0) || 0)
    );
  }, 0);

  return (
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <Card className="border-none shadow-2xl bg-gradient-to-br from-teal-600 via-emerald-500 to-indigo-500 text-white">
          <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,0.8fr)] items-center p-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                <span>📚</span> Course Library
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                Discover curated courses tailored to your learning journey.
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                Search, filter, and bookmark high-impact learning paths designed by industry experts. Every course adapts to your pace with AI-personalized recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="inverse" className="px-6" asChild>
                  <Link href="/my-learning">Continue Learning</Link>
                </Button>
                <Button variant="outline" className="border-white text-white px-6" asChild>
                  <Link href="/admin/studio">Create With AI Studio</Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Stat label="Available Courses" value={courses.length} description="Published & ready to enroll" />
              <Stat label="Subjects Covered" value={subjects.length} description="Cross-discipline catalog" />
              <Stat label="Lessons Included" value={totalLessons} description="Interactive modules" />
              <Stat label="New This Month" value={courses.filter((c) => c.createdAt).length} description="Fresh releases" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Browse the library</h2>
              <p className="text-sm text-slate-500">
                Use advanced filters to find courses by subject, proficiency, and more. Bookmark favorites to revisit anytime.
              </p>
            </div>
          </CardContent>
        </Card>

        <CourseLibrary courses={courses} />
      </div>
    </div>
  );
}

function Stat({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-wide text-white/70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/60">{description}</div>
    </div>
  );
}


