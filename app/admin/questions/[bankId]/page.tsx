import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { serializeQuestionBank, serializeQuestion } from '@/lib/models/QuestionBank';
import { QuestionEditor } from '@/components/admin/QuestionEditor';

export const dynamic = 'force-dynamic';

export default async function QuestionBankDetailPage({ params }: { params: Promise<{ bankId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const { bankId } = await params;
  const db = await getDatabase();
  const bank = await db.collection('questionBanks').findOne({ _id: new ObjectId(bankId) });
  if (!bank) {
    redirect('/admin/questions');
  }

  const questions = await db
    .collection('questionBankQuestions')
    .find({ bankId: new ObjectId(bankId) })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const serializedBank = serializeQuestionBank(bank as any);
  const serializedQuestions = questions.map((question: any) => serializeQuestion(question));

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/questions">← Question Banks</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{serializedBank.name}</h1>
          <p className="text-sm text-slate-500">
            {serializedBank.description || 'Manage question content, metadata, and exam readiness.'}
          </p>
          <div className="text-xs text-slate-400">
            Subject: {serializedBank.subject || 'N/A'} • Exam type: {serializedBank.examType || 'N/A'}
          </div>
        </div>

        <QuestionEditor bankId={bankId} initialQuestions={serializedQuestions} />
      </main>
    </div>
  );
}
