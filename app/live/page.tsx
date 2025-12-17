import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDatabase } from '@/lib/mongodb';

interface LiveRoom {
  id: string;
  roomId: string;
  roomName: string;
  roomUrl: string;
  status: string;
  createdAt: string;
  courseId?: string;
  courseTitle?: string;
}

export const dynamic = 'force-dynamic';

export default async function LiveClassesPage() {
  const db = await getDatabase();
  const rooms = await db
    .collection('liveRooms')
    .find({ status: { $in: ['active', 'scheduled'] } })
    .sort({ status: -1, createdAt: -1 })
    .limit(24)
    .toArray()
    .catch(() => []);

  const liveRooms: LiveRoom[] = rooms.map((room: any) => ({
    id: String(room._id),
    roomId: room.roomId,
    roomName: room.roomName || 'Live classroom',
    roomUrl: room.roomUrl,
    status: room.status || 'scheduled',
    createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt || new Date().toISOString(),
    courseId: room.courseId,
    courseTitle: room.courseTitle,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-[#082f49] via-[#0f766e] to-[#14b8a6] text-white">
        <div className="container mx-auto px-4 py-16 space-y-6">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70 font-semibold">Live Classroom Network</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Join real instructors in real time.
            </h1>
            <p className="text-lg text-white/80">
              AdaptIQ live classes are powered by Jitsi—no downloads, no limits. Browse the open rooms below or request a
              private cohort session for your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses">
              <Button variant="inverse" className="bg-white text-teal-700 hover:bg-white/90">
                Explore companion courses
              </Button>
            </Link>
            <Link href="/admin/live-classes">
              <Button variant="ghost" className="border border-white/50 text-white hover:bg-white/10">
                Manage live rooms
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Upcoming & Active Rooms</h2>
          <p className="text-slate-600 max-w-3xl">
            Students who are enrolled in the matching course join automatically. Guests can request access from the host.
          </p>
        </div>

        {liveRooms.length === 0 ? (
          <Card className="border border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-16 text-center space-y-3">
              <p className="text-slate-700 font-semibold">No live rooms are public at the moment.</p>
              <p className="text-sm text-slate-500">Check back soon or ask your instructor for an invite link.</p>
              <Link href="/admin/live-classes">
                <Button variant="inverse">Create a room</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {liveRooms.map((room) => (
              <Card key={room.id} className="border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-slate-900">{room.roomName}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {room.courseTitle || (room.courseId ? `Linked course: ${room.courseId}` : 'Open community room')}
                      </p>
                    </div>
                    <Badge variant={room.status === 'active' ? 'success' : 'info'}>
                      {room.status === 'active' ? 'Live now' : 'Scheduled'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Created {new Date(room.createdAt).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/live/${room.roomId}`} className="flex-1">
                      <Button variant="inverse" className="w-full">
                        Join classroom
                      </Button>
                    </Link>
                    <Button variant="outline" className="flex-1" asChild>
                      <a
                        href={room.roomUrl || `/live/${room.roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open link
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Invite learners by sharing the link. Hosts can moderate participants directly within Jitsi.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

