import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { QuestionStudio } from '@/components/admin/QuestionStudio';

export const dynamic = 'force-dynamic';

export default async function QuestionStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const banks = await db
    .collection('questionBanks')
    .find({})
    .sort({ updatedAt: -1, name: 1 })
    .limit(24)
    .toArray();

  const formatted = banks.map((bank: any) => ({
    id: String(bank._id),
    name: bank.name,
    subject: bank.subject,
    examType: bank.examType,
    tags: bank.tags,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Question & Quiz Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Build MCQs, subjective, and true/false items tailor-made for curricula, competitive exams, and adaptive quizzes.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <QuestionStudio banks={formatted} />
      </main>
    </div>
  );
}
