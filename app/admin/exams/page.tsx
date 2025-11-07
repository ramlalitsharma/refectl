import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { ExamStudio } from '@/components/admin/ExamStudio';

export const dynamic = 'force-dynamic';

export default async function AdminExamsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const [banksRaw, examsRaw] = await Promise.all([
    db.collection('questionBanks').find({}).sort({ updatedAt: -1 }).toArray(),
    db.collection('examTemplates').find({}).sort({ updatedAt: -1 }).limit(12).toArray(),
  ]);

  const questionBanks = banksRaw.map((bank: any) => ({
    id: String(bank._id),
    name: bank.name,
    subject: bank.subject,
    examType: bank.examType,
  }));

  const recentExams = examsRaw.map((exam: any) => ({
    id: String(exam._id),
    name: exam.name,
    category: exam.category,
    updatedAt: exam.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold">Exam & Preparation Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure mock exams, practice sets, and cohort-targeted preparation programs with rich blueprints.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <ExamStudio questionBanks={questionBanks} recentExams={recentExams} />
      </main>
    </div>
  );
}
