import { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { PageTurner } from '@/components/ebooks/PageTurner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ebook',
  description: 'Read modern, competitive ebooks with page-by-page chapters.',
};

async function fetchEbook(id: string) {
  try {
    const doc = await prisma.ebook.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        audience: true,
        tone: true,
        focus: true,
        tags: true,
        releaseAt: true,
        updatedAt: true,
        coverImageUrl: true,
        chapters: true,
      },
    });
    if (!doc) return null;
    const chaptersArray = Array.isArray(doc.chapters) ? (doc.chapters as any[]) : [];
    return {
      id: doc.id,
      title: doc.title || '',
      audience: doc.audience || '',
      tone: doc.tone || '',
      focus: doc.focus || '',
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      releaseAt: doc.releaseAt || null,
      updatedAt: doc.updatedAt || null,
      coverImageUrl: doc.coverImageUrl || null,
      chapters: chaptersArray.map((c: any) => ({
        title: c?.title || '',
        summary: c?.summary || '',
        keyTakeaways: Array.isArray(c?.keyTakeaways) ? c.keyTakeaways : [],
        resources: Array.isArray(c?.resources) ? c.resources : [],
      })),
    };
  } catch {
    return null;
  }
}

export default async function EbookReaderPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const ebook = await fetchEbook(id);
  if (!ebook) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold">Ebook not found</h1>
          <p className="mt-2 text-slate-600">It may have been removed or is not available.</p>
          <div className="mt-4">
            <Link href="/ebooks" className="text-teal-700 font-bold">Back to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg text-slate-900 dark:text-slate-100 selection:bg-elite-accent-cyan/30">
      <header className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-elite-accent-cyan/10 dark:bg-elite-accent-cyan/5 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="w-48 aspect-[3/4] rounded-3xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative group shrink-0">
              {ebook.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ebook.coverImageUrl}
                  alt={ebook.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 dark:from-white/5 to-transparent">
                  <span className="text-4xl text-slate-400">📚</span>
                </div>
              )}
              <div className="absolute inset-0 border-[8px] border-black/5 dark:border-black/20 pointer-events-none" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-white/10 rounded-full">
                  Neural asset
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-elite-accent-cyan/10 text-elite-accent-cyan border border-elite-accent-cyan/20 rounded-full">
                  Density: High
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-6">
                {ebook.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vector:</span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">{ebook.focus || ebook.tone || 'General'}</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                <div className="flex gap-2">
                  {(ebook.tags || []).slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[9px] font-black uppercase tracking-[0.2em] text-elite-accent-cyan">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr,320px]">
          <div className="space-y-12">
            <Suspense fallback={<div className="h-[600px] glass-card-premium rounded-[3rem] animate-pulse" />}>
              {ebook.chapters.length === 0 ? (
                <div className="glass-card-premium rounded-[3rem] p-20 text-center border border-dashed border-white/10">
                  <p className="text-slate-500 font-black uppercase tracking-widest">No segments found in this asset.</p>
                </div>
              ) : (
                <div className="glass-card-premium rounded-[3rem] p-1 border border-white/5">
                  <PageTurner chapters={ebook.chapters} />
                </div>
              )}
            </Suspense>
          </div>

          <aside className="space-y-8">
            <div className="glass-card-premium rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 dark:bg-elite-accent-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Asset Intelligence</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Group</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate ml-4">{ebook.audience || 'Universal'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Segments</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{ebook.chapters.length} Units</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 text-[9px]">
                  <span className="font-black uppercase tracking-widest text-slate-500">Last Synced</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    {ebook.updatedAt ? new Date(ebook.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/ebooks" className="block group">
              <div className="glass-card-premium rounded-3xl border border-slate-200 dark:border-white/5 p-6 flex items-center justify-between hover:border-elite-accent-cyan/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-elite-accent-cyan group-hover:scale-110 transition-transform">
                    ←
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-0.5">Return to Hub</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Library Archives</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-elite-accent-cyan opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
