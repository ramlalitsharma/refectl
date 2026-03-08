import type { Metadata } from 'next';
import { Link } from '@/lib/navigation';
import { notFound } from 'next/navigation';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NewsClusterService } from '@/lib/news-cluster-service';
import { BRAND_URL } from '@/lib/brand';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const cluster = await NewsClusterService.getClusterBySlug(slug);
  if (!cluster) return { title: 'Live Briefing Not Found | Terai Times' };

  const base = `${BRAND_URL}/${locale}/news/live/${slug}`;
  return {
    title: `${cluster.title} | Terai Times Live`,
    description: cluster.summary || 'Live intelligence brief updated in real time.',
    alternates: {
      canonical: base,
    },
  };
}

export default async function LiveNewsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const cluster = await NewsClusterService.getClusterBySlug(slug);
  if (!cluster) notFound();

  return (
    <div className="news-page-shell news-paper-theme min-h-screen pb-16">
      <NewsNavbar />
      <main className="news-viewport px-4 pt-8 space-y-6">
        <Link href="/news" className="news-back-link inline-flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={14} />
          Back to News
        </Link>
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 shadow-xl">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black mb-2">
            Live Intelligence Brief
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{cluster.title}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {cluster.summary}
          </p>
          <div className="mt-4 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black">
            Updated {new Date(cluster.updatedAt).toLocaleString()}
          </div>
        </section>

        <section className="grid gap-4">
          {cluster.items.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black mb-1">
                {item.category} · {item.country}
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{item.summary}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
