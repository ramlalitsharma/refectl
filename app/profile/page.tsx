import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { auth, currentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/profile')}`);
  }

  const [sessionUser, db] = await Promise.all([currentUser(), getDatabase()]);
  const [userDoc, enrollments, completions] = await Promise.all([
    db.collection('users').findOne({ clerkId: userId }),
    db.collection('enrollments').find({ userId }).sort({ updatedAt: -1 }).limit(20).toArray(),
    db.collection('courseCompletions').find({ userId }).toArray(),
  ]);

  const courseIds = Array.from(new Set(enrollments.map((enrollment: any) => enrollment.courseId).filter(Boolean)));
  const objectIds = courseIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));

  const courses = courseIds.length
    ? await db
        .collection('courses')
        .find({
          $or: [
            ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
            { slug: { $in: courseIds } },
          ],
        })
        .project({ title: 1, slug: 1, thumbnail: 1, level: 1, subject: 1 })
        .toArray()
    : [];

  const courseMap = new Map<string, any>();
  courses.forEach((course: any) => {
    if (course._id) courseMap.set(String(course._id), course);
    if (course.slug) courseMap.set(course.slug, course);
  });

  const completedIds = new Set(completions.map((completion: any) => completion.courseId));

  const stats = {
    totalEnrollments: enrollments.length,
    completedCourses: completedIds.size,
    inProgress: enrollments.filter((enrollment: any) => enrollment.status === 'approved').length,
    waitlisted: enrollments.filter((enrollment: any) => enrollment.status === 'waitlisted').length,
  };

  const profileName =
    sessionUser?.firstName || sessionUser?.lastName
      ? `${sessionUser?.firstName || ''} ${sessionUser?.lastName || ''}`.trim()
      : userDoc?.name || userDoc?.email || sessionUser?.email || 'Learner';

  const highlightEnrollments = enrollments.slice(0, 4).map((enrollment: any) => {
    const course = courseMap.get(enrollment.courseId) || courseMap.get(enrollment.courseSlug || '');
    return {
      id: enrollment._id ? String(enrollment._id) : `${enrollment.userId}:${enrollment.courseId}`,
      status: completedIds.has(enrollment.courseId) ? 'completed' : enrollment.status,
      progress: completedIds.has(enrollment.courseId) ? 100 : enrollment.progress || 0,
      courseTitle: course?.title || enrollment.courseTitle || 'Course',
      courseSlug: course?.slug || enrollment.courseSlug || enrollment.courseId,
      level: course?.level,
      subject: course?.subject,
    };
  });

  const roleBadge =
    (userDoc?.role as string) ||
    (userDoc?.isSuperAdmin ? 'Superadmin' : userDoc?.isAdmin ? 'Admin' : userDoc?.isTeacher ? 'Teacher' : 'Learner');

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/80">Profile</p>
                  <h1 className="text-3xl font-bold">{profileName}</h1>
                  <div className="flex gap-2">
                    <Badge variant="info" className="bg-white/20 text-white border border-white/20">
                      {roleBadge}
                    </Badge>
                    {userDoc?.permissions?.includes('teacher:access') && (
                      <Badge variant="default" className="bg-white/10 text-white border border-white/30">
                        Creator mode
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-white/80">
                {userDoc?.headline ||
                  'Personalized learning powered by AI recommendations, live cohorts, and adaptive study paths.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button variant="inverse" className="bg-white text-teal-700 hover:bg-white/90">
                    Go to dashboard
                  </Button>
                </Link>
                <Link href="/my-learning">
                  <Button variant="ghost" className="border border-white/40 text-white hover:bg-white/10">
                    Continue learning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-white/70">
            <CardHeader>
              <CardTitle>Learning stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-slate-900">{stats.totalEnrollments}</p>
                <p className="text-xs text-slate-500 uppercase">Enrollments</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
                <p className="text-xs text-slate-500 uppercase">In progress</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-slate-900">{stats.completedCourses}</p>
                <p className="text-xs text-slate-500 uppercase">Completed</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-slate-900">{stats.waitlisted}</p>
                <p className="text-xs text-slate-500 uppercase">Waitlisted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Active learning plan</CardTitle>
              <p className="text-sm text-slate-500">Courses you enrolled in recently.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {highlightEnrollments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                  You have not enrolled in any courses yet. Explore the catalog to get started.
                </div>
              ) : (
                highlightEnrollments.map((item) => (
                  <Link key={item.id} href={`/courses/${item.courseSlug}`} className="block">
                    <div className="rounded-2xl border border-slate-100 p-4 hover:border-teal-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{item.courseTitle}</p>
                          <p className="text-xs text-slate-500">
                            {item.subject || 'General'} • {item.level || 'All levels'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.status === 'completed'
                              ? 'success'
                              : item.status === 'approved'
                              ? 'info'
                              : item.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {item.status === 'completed'
                            ? 'Completed'
                            : item.status === 'approved'
                            ? 'In progress'
                            : item.status === 'pending'
                            ? 'Awaiting approval'
                            : item.status === 'waitlisted'
                            ? 'Waitlisted'
                            : item.status}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all"
                          style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/forum" className="block">
                <div className="rounded-2xl border border-slate-100 px-4 py-3 hover:border-teal-200 transition">
                  <p className="text-sm font-semibold text-slate-900">Ask the community</p>
                  <p className="text-xs text-slate-500">Share blockers, tips, and wins.</p>
                </div>
              </Link>
              <Link href="/live" className="block">
                <div className="rounded-2xl border border-slate-100 px-4 py-3 hover:border-teal-200 transition">
                  <p className="text-sm font-semibold text-slate-900">Join a live class</p>
                  <p className="text-xs text-slate-500">Check the real-time cohort schedule.</p>
                </div>
              </Link>
              <Link href="/contact" className="block">
                <div className="rounded-2xl border border-slate-100 px-4 py-3 hover:border-teal-200 transition">
                  <p className="text-sm font-semibold text-slate-900">Message support</p>
                  <p className="text-xs text-slate-500">Priority help for premium learners.</p>
                </div>
              </Link>
              <Link href="/settings" className="block">
                <div className="rounded-2xl border border-slate-100 px-4 py-3 hover:border-teal-200 transition">
                  <p className="text-sm font-semibold text-slate-900">Account preferences</p>
                  <p className="text-xs text-slate-500">Manage notifications and security.</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

