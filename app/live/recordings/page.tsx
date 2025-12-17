import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function RecordingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const db = await getDatabase();

  // Get user's recordings
  const user = await db.collection('users').findOne({ clerkId: userId });
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  let recordings: any[] = [];
  if (isAdmin) {
    // Admins see all recordings
    recordings = await db
      .collection('liveClassRecordings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
  } else {
    // Get instructor rooms
    const instructorRooms = await db
      .collection('liveRooms')
      .find({ createdBy: userId })
      .project({ roomId: 1 })
      .toArray();

    const roomIds = instructorRooms.map((r: any) => r.roomId);

    // Get recordings for enrolled courses
    const enrollments = await db
      .collection('enrollments')
      .find({ userId, status: 'approved' })
      .project({ courseId: 1 })
      .toArray();

    const courseIds = enrollments.map((e: any) => e.courseId);
    const courseRooms = await db
      .collection('liveRooms')
      .find({ courseId: { $in: courseIds } })
      .project({ roomId: 1 })
      .toArray();

    const courseRoomIds = courseRooms.map((r: any) => r.roomId);
    const allRoomIds = [...roomIds, ...courseRoomIds];

    if (allRoomIds.length > 0) {
      recordings = await db
        .collection('liveClassRecordings')
        .find({ roomId: { $in: allRoomIds } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
    }
  }

  // Get room information
  const roomIds = [...new Set(recordings.map((r: any) => r.roomId))];
  const rooms = await db
    .collection('liveRooms')
    .find({ roomId: { $in: roomIds } })
    .toArray();

  const roomMap = new Map(rooms.map((r: any) => [r.roomId, r]));

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Class Recordings</h1>
            <p className="text-slate-600 mt-1">View and manage live class recordings</p>
          </div>
          <Link href="/live">
            <Button variant="outline">Back to Live Classes</Button>
          </Link>
        </div>

        {recordings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-slate-600">No recordings available yet.</p>
              <p className="text-sm text-slate-500 mt-2">
                Recordings will appear here after classes are recorded.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordings.map((recording: any) => {
              const room = roomMap.get(recording.roomId);
              return (
                <Card key={String(recording._id)} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {room?.roomName || recording.roomId}
                      </CardTitle>
                      <Badge
                        variant={
                          recording.status === 'ready'
                            ? 'success'
                            : recording.status === 'processing'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {recording.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-slate-600">
                      <p>
                        Duration: {recording.duration ? `${Math.floor(recording.duration / 60)} min` : 'N/A'}
                      </p>
                      <p className="mt-1">
                        Recorded: {new Date(recording.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {recording.recordingUrl && recording.status === 'ready' ? (
                      <div className="flex gap-2">
                        <a
                          href={recording.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="inverse" size="sm" className="w-full">
                            Watch Recording
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Processing...</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

