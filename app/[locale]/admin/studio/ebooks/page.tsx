import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { prisma } from '@/lib/prisma';
import { PremiumEbookStudio } from '@/components/admin/PremiumEbookStudio';

export const dynamic = 'force-dynamic';

export default async function EbookStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const ebooks = await prisma.ebook.findMany({
    select: { id: true, title: true, updatedAt: true, status: true },
    orderBy: { updatedAt: 'desc' },
    take: 12,
  });
  const summaries = ebooks.map((ebook: { id: any; title: any; updatedAt: any; status?: any }) => ({
    id: ebook.id,
    title: ebook.title,
    updatedAt: ebook.updatedAt,
    status: ebook.status,
  }));

  return (
    <div className="min-h-screen bg-background dark:bg-elite-bg overflow-hidden">
      <PremiumEbookStudio recentEbooks={summaries} />
    </div>
  );
}
