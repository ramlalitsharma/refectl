import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { LiveClassManager } from '@/components/admin/LiveClassManager';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLiveClassesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    const { requireAdmin } = await import('@/lib/admin-check');
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const rooms = await db
    .collection('liveRooms')
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const roomsData = rooms.map((room: any) => ({
    id: String(room._id),
    roomId: room.roomId,
    roomName: room.roomName,
    roomUrl: room.roomUrl,
    courseId: room.courseId,
    createdBy: room.createdBy,
    createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt,
    status: room.status || 'scheduled',
    config: room.config || {},
  }));

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Live Classes' },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live Classroom Management</h1>
            <p className="text-slate-600 mt-2">Create and manage live video classrooms for courses</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/live-classes/schedule">
              <Button variant="inverse">Schedule Class</Button>
            </Link>
            <Link href="/live/recordings">
              <Button variant="outline">View Recordings</Button>
            </Link>
          </div>
        </div>

        <LiveClassManager initialRooms={roomsData} />
      </div>
    </div>
  );
}

