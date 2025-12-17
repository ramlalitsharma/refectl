import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ScheduleClassForm } from '@/components/admin/ScheduleClassForm';

export const dynamic = 'force-dynamic';

export default async function ScheduleLiveClassPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  
  // Get courses for linking
  const courses = await db
    .collection('courses')
    .find({ status: 'published' })
    .project({ _id: 1, title: 1, slug: 1 })
    .limit(100)
    .toArray();

  // Get upcoming scheduled classes
  const upcomingClasses = await db
    .collection('liveRooms')
    .find({
      status: { $in: ['scheduled', 'active'] },
      scheduledStartTime: { $gte: new Date() },
    })
    .sort({ scheduledStartTime: 1 })
    .limit(20)
    .toArray();

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Schedule Live Class</h1>
            <p className="text-slate-600 mt-1">Create and manage scheduled live classes</p>
          </div>
          <Link href="/admin/live-classes">
            <Button variant="outline">Back to Live Classes</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scheduled Class</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleClassForm courses={courses.map((c: any) => ({
                id: String(c._id),
                title: c.title,
                slug: c.slug,
              }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming classes</p>
              ) : (
                upcomingClasses.map((classItem: any) => (
                  <div key={String(classItem._id)} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{classItem.roomName}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {classItem.scheduledStartTime
                            ? new Date(classItem.scheduledStartTime).toLocaleString()
                            : 'Not scheduled'}
                        </p>
                      </div>
                      <Link href={`/live/${classItem.roomId}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

