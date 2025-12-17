import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { LiveClassroomWrapper } from '@/components/live/LiveClassroomWrapper';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/Card';
import { createJitsiRoom } from '@/lib/live/jitsi';

export const dynamic = 'force-dynamic';

interface LiveRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function LiveRoomPage({ params }: LiveRoomPageProps) {
  const { roomId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const db = await getDatabase();
  const room = await db.collection('liveRooms').findOne({ roomId });

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
            <p className="text-slate-600">The live classroom room could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use Jitsi (free) - no token needed
  const provider = room.provider || 'jitsi';
  const jitsiRoom = provider === 'jitsi' 
    ? createJitsiRoom({ roomName: room.roomName, isModerator: room.createdBy === userId })
    : null;

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Live Classes', href: '/live' },
            { label: room.roomName || 'Classroom' },
          ]}
        />

        <div className="max-w-7xl mx-auto">
          <LiveClassroomWrapper
            roomUrl={jitsiRoom?.roomUrl || room.roomUrl}
            roomName={room.roomName}
            isInstructor={room.createdBy === userId}
            provider={provider as 'jitsi' | 'daily'}
          />
        </div>
      </div>
    </div>
  );
}

