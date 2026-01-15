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

  // Fetch published live courses and their associated rooms
  const [liveCourses, allLiveRooms] = await Promise.all([
    db.collection('courses')
      .find({ type: 'live-course', status: 'published' })
      .toArray(),
    db.collection('liveRooms')
      .find({ status: { $in: ['active', 'scheduled', 'ready'] }, contentType: { $ne: 'video' } })
      .sort({ createdAt: -1 })
      .toArray()
  ]).catch(() => [[], []]);

  // Get course IDs from published live courses
  const publishedCourseIds = new Set(liveCourses.map((c: any) => String(c._id)));

  // Filter rooms to only include those associated with published live courses
  const liveRooms = allLiveRooms.filter((room: any) => {
    const courseId = room.courseId;
    // Include room if it's associated with a published live course
    // Exclude draft sessions and rooms without valid course IDs
    return courseId && courseId !== 'draft-session' && publishedCourseIds.has(courseId);
  });

  const liveContent = liveRooms.map((room: any) => ({
    id: String(room._id),
    roomId: room.roomId,
    roomName: room.roomName || 'Live classroom',
    status: room.status || 'scheduled',
    courseTitle: room.courseTitle || room.courseId || 'Open Session',
    createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt || new Date().toISOString(),
    scheduledStartTime: room.scheduledStartTime instanceof Date ? room.scheduledStartTime.toISOString() : room.scheduledStartTime || null,
  }));

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      {/* Cinematic Hero Section - ultra premium */}
      <div className="relative min-h-[85vh] w-full overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070"
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
            alt="Hero Background"
          />
        </div>

        <div className="container mx-auto px-6 relative z-20 flex-1 flex flex-col justify-center max-w-7xl py-20">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Proprietary Learning Ecosystem</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Mastery <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Level: Expert.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
              Join real-time interactive sessions with expert instructors. Experience live Q&A, collaborative learning, and instant feedback in our premium virtual classrooms.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="#live-grid">
                <Button className="bg-white text-black hover:bg-slate-200 px-10 py-7 rounded-full font-black text-sm uppercase tracking-widest transition-all">
                  Join Live
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-30 space-y-32 -mt-10 pb-32">

        {/* Active Broadcasts Section */}
        <section id="live-grid" className="space-y-12">
          <div className="flex items-end justify-between border-b border-white/10 pb-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight">Active Broadcasts</h2>
              <p className="text-slate-500 font-medium">Real-time interactive environments synchronized globally.</p>
            </div>
            <Badge className="border border-blue-500/50 text-blue-400 bg-transparent px-4 py-1 font-bold">
              {liveContent.length} BROADCASTS ONLINE
            </Badge>
          </div>

          {liveContent.length === 0 ? (
            <div className="py-32 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl opacity-40">📡</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Frequency Silent</h3>
                <p className="text-slate-500 max-w-xs mx-auto">All active instructors are currently offline. Next scheduled broadcast in 14 minutes.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {liveContent.map((room) => (
                <div key={room.id} className="group bg-[#161b22] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1577891729319-66381c6181b5?q=80&w=1470`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        On Air
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{room.courseTitle}</p>
                      <h3 className="text-2xl font-black leading-tight group-hover:text-blue-400 transition-colors">{room.roomName}</h3>
                      {room.scheduledStartTime && (
                        <p className="text-sm text-slate-400 font-medium">
                          Next class: {new Date(room.scheduledStartTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Link href={`/live/${room.roomId}`} className="block">
                      <Button className="w-full bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl py-7 font-black transition-all">
                        ENTER STUDIO
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
      `}} />
    </div>
  );
}


