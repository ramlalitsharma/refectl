import { requireEventManager } from '@/lib/admin-check';
import { EventEditor } from '@/components/news/EventEditor';

export const dynamic = 'force-dynamic';

export default async function CreateEventPage() {
  await requireEventManager();
  return <EventEditor mode="create" />;
}

