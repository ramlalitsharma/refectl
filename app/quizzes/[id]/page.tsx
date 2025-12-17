import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
        notFound();
    }

    const db = await getDatabase();
    const bank = await db.collection('questionBanks').findOne({ _id: new ObjectId(id) });

    if (!bank) {
        notFound();
    }

    const questions = await db
        .collection('questionBankQuestions')
        .find({ bankId: new ObjectId(id) })
        .toArray();

    const serializedQuestions = questions.map((q: any) => ({
        id: String(q._id),
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer, // Only safe to expose if we trust the client logic (QuizPlayer checks answer vs option ID or correct flag)
        // Note: In a highly secure environment, we wouldn't send 'correct' flags to client.
        // But QuizPlayer expects them to validate locally for instant feedback.
        answerExplanation: q.answerExplanation,
        difficulty: q.difficulty,
    }));

    // Ensure options have the 'correct' flag if expected by QuizPlayer
    // The DB stores options as { id, text, correct } usually for multiple choice.
    // QuizPlayer uses option.correct to validate.

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <SiteBrand />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/quizzes">
                            <Button variant="outline" size="sm">Exit Quiz</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <QuizPlayer
                    title={bank.name}
                    questions={serializedQuestions}
                    quizId={id}
                />
            </main>
        </div>
    );
}
