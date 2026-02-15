import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';
import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { EventsStudioBoard } from '@/components/news/EventsStudioBoard';

export const dynamic = 'force-dynamic';

export default async function EventsStudioPage() {
  await requireEventManager();
  const events = await NewsEventService.getAllEvents().catch(() => []);

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 p-8 md:p-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Special Events Studio</h1>
          <p className="text-slate-400 mt-2">Create country-specific and global event banners for News and Home pages.</p>
        </div>
        <Link href="/admin/studio/events/create">
          <Button className="bg-elite-accent-cyan text-black hover:bg-white font-black uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      <EventsStudioBoard
        initialEvents={(events as any[]).map((e: any) => ({
          ...e,
          _id: String(e._id),
        }))}
      />
    </div>
  );
}
