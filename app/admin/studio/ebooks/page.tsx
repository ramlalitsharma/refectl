import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { EbookStudio } from '@/components/admin/EbookStudio';

export const dynamic = 'force-dynamic';

export default async function EbookStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const ebooks = await db.collection('ebooks').find({}).sort({ updatedAt: -1 }).limit(12).toArray();
  const summaries = ebooks.map((ebook: any) => ({
    id: String(ebook._id),
    title: ebook.title,
    updatedAt: ebook.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Ebook & Notes Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Produce structured ebooks, revision notes, and study guides with generated chapter outlines.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <EbookStudio recentEbooks={summaries} />
      </main>
    </div>
  );
}
