import type { Metadata } from 'next';
import { format } from 'date-fns';
import { NewsService } from '@/lib/news-service';
import { getNewsAuthorById } from '@/lib/news-authors';
import { BRAND_URL } from '@/lib/brand';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NewsImage } from '@/components/news/NewsImage';
import Link from 'next/link';
import { ArrowLeft, FileText, Globe2, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const authorId = decodeURIComponent(id);
  const author = await getNewsAuthorById(authorId);
  return {
    title: `${author.name} | Author Desk | Terai Times`,
    description: `Read professional reports and newsroom analysis by ${author.name} at Terai Times.`,
    alternates: {
      canonical: `${BRAND_URL}/news/author/${encodeURIComponent(authorId)}`,
    },
  };
}

export default async function NewsAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = decodeURIComponent(id);
  const author = await getNewsAuthorById(authorId);

  const published = await NewsService.getPublishedNews();
  const articles = published
    .filter((item: any) => item.author_id === authorId)
    .sort((a: any, b: any) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

  const trendingCount = articles.filter((a: any) => a.is_trending).length;
  const categories = Array.from(new Set(articles.map((a: any) => a.category).filter(Boolean)));

  return (
    <div className="news-page-shell min-h-screen pb-16">
      <NewsNavbar />
      <main className="container mx-auto px-4 pt-8">
        <section className="news-author-hero">
          <Link href="/news" className="news-back-link">
            <ArrowLeft size={14} />
            Back to News
          </Link>
          <div className="news-author-head">
            <div className="news-author-avatar">
              {author.profilePicture ? (
                <NewsImage src={author.profilePicture} alt={author.name} className="w-full h-full" />
              ) : (
                <span>{author.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="news-kicker">Author Desk</p>
              <h1 className="news-author-name">{author.name}</h1>
              <p className="news-author-role">{author.role || 'News Writer'}</p>
              <p className="news-author-bio">
                {author.bio || 'Professional newsroom author delivering verified reporting, strategic context, and high-signal editorial analysis.'}
              </p>
            </div>
          </div>

          <div className="news-author-metrics">
            <div>
              <p>Published</p>
              <h3>{articles.length}</h3>
            </div>
            <div>
              <p>Trending</p>
              <h3>{trendingCount}</h3>
            </div>
            <div>
              <p>Coverage</p>
              <h3>{categories.length}</h3>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="news-section-head">
            <h2>Latest Reports By {author.name}</h2>
            <span>{articles.length} published pieces</span>
          </div>
          {articles.length ? (
            <div className="news-author-grid">
              {articles.map((item: any) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="news-author-card">
                  <div className="news-author-card-media">
                    <NewsImage src={item.cover_image || '/news-placeholder.jpg'} alt={item.title} className="w-full h-full" />
                  </div>
                  <div className="news-author-card-body">
                    <p className="news-pick-tag">
                      <Globe2 size={12} />
                      {item.country || 'Global'} • {item.category || 'General'}
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="news-author-card-meta">
                      <span>{format(new Date(item.published_at || item.created_at), 'MMMM dd, yyyy')}</span>
                      {item.is_trending ? (
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp size={12} />
                          Trending
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="news-empty-shell">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h2 className="text-xl font-black text-slate-900">No Published Reports Yet</h2>
              <p className="text-slate-600 mt-2">This author desk has no live published reports at the moment.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
