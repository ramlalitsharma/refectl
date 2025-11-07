import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const db = await getDatabase();

  const courseDocs = await db
    .collection('courses')
    .find({ status: 'published' })
    .limit(24)
    .toArray();
  const courses = courseDocs.map((course: any) => ({
    ...course,
    _id: String(course._id),
    slug: course.slug || String(course._id),
  }));

  const userProgress = await db.collection('userProgress').find({ userId }).toArray();
  const progress = userProgress.reduce((acc: Record<string, { completed: number; total: number; lastAccessed?: Date }>, p: any) => {
    const courseId = p.courseId || p.subject;
    if (!courseId) return acc;
    if (!acc[courseId]) acc[courseId] = { completed: 0, total: 0, lastAccessed: p.updatedAt || p.completedAt };
    acc[courseId].completed += 1;
    acc[courseId].total += 1;
    if (p.updatedAt && (!acc[courseId].lastAccessed || p.updatedAt > acc[courseId].lastAccessed!)) {
      acc[courseId].lastAccessed = p.updatedAt;
    }
    return acc;
  }, {});

  const completions = await db.collection('courseCompletions').find({ userId }).sort({ completedAt: -1 }).limit(6).toArray();

  const activeCourses = courses.filter((course) => progress[course._id]);
  const lessonsCompleted = Object.values(progress).reduce((sum, p) => sum + p.completed, 0);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-10 space-y-10">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)] items-center">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white">
            <CardContent className="space-y-4 p-8">
              <div className="text-sm uppercase tracking-wide text-white/80">Your Learning Hub</div>
              <h1 className="text-3xl font-semibold">
                Hi {user?.firstName || user?.email || 'Learner'}, keep your learning journey going.
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                Access active courses, download certificates, and discover new subjects tailored to your goals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/courses">
                  <Button variant="inverse" className="px-6">Browse Courses</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white text-white px-6">Go to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
              <Stat label="Active Courses" value={activeCourses.length} icon="📚" />
              <Stat label="Lessons Completed" value={lessonsCompleted} icon="✅" />
              <Stat label="Certificates" value={completions.length} icon="🎓" />
              <Stat label="Total Subjects" value={new Set(userProgress.map((p) => p.subject).filter(Boolean)).size} icon="🧠" />
            </CardContent>
          </Card>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Active Courses</h2>
            <Link href="/courses">
              <Button variant="outline" className="px-6">Explore More</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeCourses.length ? (
              activeCourses.map((course) => {
                const courseProgress = progress[course._id] || { completed: 0, total: 0 };
                const lessonCount = course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0;
                const percent = lessonCount ? Math.round((courseProgress.completed / lessonCount) * 100) : 0;

                return (
                  <Card key={course._id} className="shadow-md border-none">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase text-slate-500">{course.subject || 'General'}</div>
                        <div className="text-xs text-slate-400">
                          {courseProgress.lastAccessed ? new Date(courseProgress.lastAccessed).toLocaleDateString() : 'New'}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-semibold text-slate-800">{percent}%</span>
                        </div>
                        <Progress value={percent} color="teal" />
                      </div>
                      <Button className="w-full" variant="inverse" asChild>
                        <Link href={`/courses/${course.slug}`}>Continue Learning</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="shadow-md border-none">
                <CardContent className="p-6 text-sm text-slate-600">
                  You don&apos;t have active courses yet. Enroll in a course to see it here.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Certificates</h2>
            <Link href="/courses">
              <Button variant="outline" className="px-6">Earn More</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completions.length ? (
              completions.map((cert: any) => (
                <Card key={cert.certificateId} className="shadow-md border-none">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase text-slate-500">
                      <span>Certificate</span>
                      <span>{new Date(cert.completedAt || cert.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{cert.courseName || 'Course Completed'}</h3>
                    <div className="flex gap-3">
                      <Link href={`/certificates/${cert.certificateId}`}>
                        <Button size="sm">View</Button>
                      </Link>
                      <Link href={`/certificates/pdf/${cert.certificateId}`}>
                        <Button size="sm" variant="outline">Download</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-md border-none">
                <CardContent className="p-6 text-sm text-slate-600">
                  Complete a course to earn your first certificate. Track progress above to see what&apos;s next.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">Recommended For You</h2>
          <CourseRecommendations />
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <div className="text-lg font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

