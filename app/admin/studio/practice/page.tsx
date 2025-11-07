import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { PracticeStudio } from '@/components/admin/PracticeStudio';

export const dynamic = 'force-dynamic';

export default async function PracticeStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const [banks, practiceSets] = await Promise.all([
    db.collection('questionBanks').find({}).sort({ name: 1 }).toArray(),
    db.collection('practiceSets').find({}).sort({ updatedAt: -1 }).limit(12).toArray(),
  ]);

  const bankSummaries = banks.map((bank: any) => ({ id: String(bank._id), name: bank.name }));
  const practiceSummaries = practiceSets.map((set: any) => ({ id: String(set._id), title: set.title, updatedAt: set.updatedAt }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Practice Set Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assemble adaptive practice sets from curated question banks and schedule releases for cohorts.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <PracticeStudio banks={bankSummaries} recentPracticeSets={practiceSummaries} />
      </main>
    </div>
  );
}
