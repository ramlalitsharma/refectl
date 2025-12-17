import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { serializeEnrollment } from '@/lib/models/Enrollment';
import { ObjectId } from 'mongodb';
import { EnrollmentManager } from '@/components/admin/EnrollmentManager';

export const dynamic = 'force-dynamic';

export default async function AdminEnrollmentsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const enrollmentsRaw = await db
    .collection('enrollments')
    .find({})
    .sort({ requestedAt: -1 })
    .limit(200)
    .toArray();

  const userIds = Array.from(new Set(enrollmentsRaw.map((e: any) => e.userId).filter(Boolean)));
  const courseIds = Array.from(new Set(enrollmentsRaw.map((e: any) => e.courseId).filter(Boolean)));
  const courseSlugs = Array.from(new Set(enrollmentsRaw.map((e: any) => e.courseSlug).filter(Boolean)));

  const userObjectIds = userIds
    .filter((id: string) => ObjectId.isValid(id))
    .map((id: string) => new ObjectId(id));

  const courseObjectIds = courseIds
    .filter((id: string) => ObjectId.isValid(id))
    .map((id: string) => new ObjectId(id));

  const [users, courses] = await Promise.all([
    db
      .collection('users')
      .find({
        $or: [
          { clerkId: { $in: userIds } },
          ...(userObjectIds.length > 0 ? [{ _id: { $in: userObjectIds } }] : []),
        ],
      })
      .toArray(),
    db
      .collection('courses')
      .find({
        $or: [
          ...(courseObjectIds.length > 0 ? [{ _id: { $in: courseObjectIds } }] : []),
          { slug: { $in: [...courseIds, ...courseSlugs] } },
        ],
      })
      .toArray(),
  ]);

  const userMap = new Map<string, any>();
  users.forEach((user: any) => {
    if (user.clerkId) userMap.set(user.clerkId, user);
    if (user._id) userMap.set(String(user._id), user);
  });

  const courseMap = new Map<string, any>();
  courses.forEach((course: any) => {
    if (course._id) courseMap.set(String(course._id), course);
    if (course.slug) courseMap.set(course.slug, course);
  });

  const enrollments = enrollmentsRaw.map((record: any) => {
    const serialized = serializeEnrollment(record);
    const user = userMap.get(record.userId) || {};
    const course = courseMap.get(record.courseId) || {};

    return {
      ...serialized,
      userName: user.name || user.fullName || user.email || 'Unknown user',
      userEmail: user.email || '',
      courseTitle: serialized.courseTitle || course.title || 'Course',
      courseSlug: serialized.courseSlug || course.slug || '',
      history: (record.history || []).map((entry: any) => ({
        status: entry.status,
        changedAt: entry.changedAt instanceof Date ? entry.changedAt.toISOString() : entry.changedAt,
        adminId: entry.adminId || null,
        note: entry.note || null,
      })),
      requestedAt: serialized.requestedAt,
      decidedAt: serialized.decidedAt,
      adminId: serialized.adminId,
    };
  });

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">← Admin Panel</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">Enrollment Operations</h1>
          <p className="text-sm text-slate-500">
            Approve, waitlist, or reject learner enrollment requests. Assign cohorts and keep track of notes for each decision.
          </p>
        </div>

        <EnrollmentManager initialEnrollments={enrollments} />
      </main>
    </div>
  );
}
