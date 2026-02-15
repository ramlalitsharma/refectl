import { notFound } from 'next/navigation';
import { requireEventManager } from '@/lib/admin-check';
import { NewsEventService } from '@/lib/news-event-service';
import { EventEditor } from '@/components/news/EventEditor';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEventManager();
  const { id } = await params;
  const item = await NewsEventService.getEventById(id);
  if (!item) notFound();
  return <EventEditor mode="edit" initialData={{ ...(item as any), _id: String((item as any)._id) }} />;
}

