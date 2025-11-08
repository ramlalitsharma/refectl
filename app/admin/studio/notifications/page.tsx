import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { NotificationStudio } from '@/components/admin/NotificationStudio';

export const dynamic = 'force-dynamic';

export default async function NotificationsStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const [templates, triggers] = await Promise.all([
    db.collection('notificationTemplates').find({}).sort({ updatedAt: -1 }).limit(24).toArray(),
    db.collection('notificationTriggers').find({}).sort({ updatedAt: -1 }).limit(24).toArray(),
  ]);

  const templateSummaries = templates.map((template: any) => ({
    id: String(template._id),
    name: template.name,
    channel: template.channel,
    category: template.category,
    updatedAt: template.updatedAt,
  }));

  const triggerSummaries = triggers.map((trigger: any) => ({
    id: String(trigger._id),
    name: trigger.name,
    eventKey: trigger.eventKey,
    enabled: trigger.enabled,
    updatedAt: trigger.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Notifications Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Craft notification templates and connect them to lifecycle events across in-app, email, and SMS channels.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <NotificationStudio templates={templateSummaries as any} triggers={triggerSummaries as any} />
      </main>
    </div>
  );
}
