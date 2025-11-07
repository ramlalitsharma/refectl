import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminStudioHub() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const studios = [
    {
      name: 'Course Studio',
      description: 'AI-assisted curriculum builder, manual module editor, workflow publishing.',
      href: '/admin/studio/courses',
      icon: '📚',
    },
    {
      name: 'Blog Studio',
      description: 'Marketing-grade content generation with SEO controls and CTA guidance.',
      href: '/admin/studio/blogs',
      icon: '📝',
    },
    {
      name: 'Exam Studio',
      description: 'Design timed assessments by orchestrating question banks and scoring models.',
      href: '/admin/exams',
      icon: '🧠',
    },
    {
      name: 'Question Bank Studio',
      description: 'Author reusable question pools with tagging, difficulty, and version history.',
      href: '/admin/questions',
      icon: '🗂️',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Studios</h1>
          <p className="text-sm text-slate-500">
            Choose the workspace tailored for the asset you want to build. Each studio comes with AI helpers, manual controls, and publishing workflow.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {studios.map((studio) => (
            <div key={studio.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{studio.icon}</span>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">{studio.name}</h2>
                  <p className="text-sm text-slate-500">{studio.description}</p>
                  <Button asChild className="mt-2 w-fit">
                    <Link href={studio.href}>Launch {studio.name.split(' ')[0]} →</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


