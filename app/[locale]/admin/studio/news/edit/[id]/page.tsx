import { requireContentWriter } from '@/lib/admin-check';
import { NewsEditor } from '@/components/news/NewsEditor';
import { NewsService } from '@/lib/news-service';
import { notFound } from 'next/navigation';
import { CleanUrl } from '@/components/admin/CleanUrl';

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireContentWriter();
    const { id } = await params;

    const news = await NewsService.getNewsById(id).catch(() => null);

    if (!news) return notFound();

    return (
        <>
            <CleanUrl />
            <NewsEditor mode="edit" initialData={news} />
        </>
    );
}
