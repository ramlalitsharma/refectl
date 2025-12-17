import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { auth } from '@/lib/auth';
import { GlobalSearch } from '@/components/search/GlobalSearch';

export const dynamic = 'force-dynamic';

export default async function QuestionBankPage() {
    const { userId } = await auth();
    const db = await getDatabase();

    // Fetch all banks
    const banks = await db
        .collection('questionBanks')
        .find({})
        .sort({ subject: 1, name: 1 })
        .toArray();

    // Group by Subject
    const bySubject: Record<string, any[]> = {};
    banks.forEach((bank: any) => {
        const subj = bank.subject || 'General';
        if (!bySubject[subj]) bySubject[subj] = [];
        bySubject[subj].push(bank);
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <SiteBrand />
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {userId ? (
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/sign-in">
                                <Button size="sm">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Question Bank</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Browse our extensive collection of questions by subject for targeted practice.
                            </p>
                        </div>
                    </div>
                </div>

                {Object.keys(bySubject).length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">No question banks found</h3>
                        <p className="text-slate-500">Check back later.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(bySubject).map(([subject, subjectBanks]) => (
                            <section key={subject} className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b pb-2">
                                    {subject}
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {subjectBanks.map((bank: any) => (
                                        <Card key={String(bank._id)} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {bank.examType || 'Practice'}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg leading-tight">{bank.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="mt-auto pt-0">
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {bank.tags?.slice(0, 3).map((tag: string) => (
                                                        <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Link href={`/quizzes/${String(bank._id)}`}>
                                                    <Button variant="secondary" className="w-full text-sm">
                                                        Practice Now
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
