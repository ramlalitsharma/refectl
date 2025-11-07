import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { TutorialStudio } from '@/components/admin/TutorialStudio';

export const dynamic = 'force-dynamic';

export default async function TutorialsStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const tutorials = await db.collection('tutorials').find({}).sort({ updatedAt: -1 }).limit(12).toArray();
  const summaries = tutorials.map((tutorial: any) => ({
    id: String(tutorial._id),
    title: tutorial.title,
    format: tutorial.format,
    updatedAt: tutorial.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Tutorial & Lecture Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Script lectures, demos, and cohort-ready tutorials with AI assistance and resource management.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <TutorialStudio recentTutorials={summaries} />
      </main>
    </div>
  );
}
