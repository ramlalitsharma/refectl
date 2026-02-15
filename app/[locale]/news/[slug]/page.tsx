import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NewsService } from '@/lib/news-service';
import { Clock3, Globe2, ArrowLeft, Share2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { BRAND_URL } from '@/lib/brand';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { AdBlockerDetector } from '@/components/ads/AdBlockerDetector';
import { CommentsGate } from '@/components/news/CommentsGate';
import { NewsImage } from '@/components/news/NewsImage';
import { getNewsAuthorById } from '@/lib/news-authors';

function formatDate(value?: string) {
  const d = value ? new Date(value) : new Date();
  return format(Number.isNaN(d.getTime()) ? new Date() : d, 'MMMM dd, yyyy');
}

function estimateReadMinutes(html: string): number {
  const plain = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plain ? plain.split(' ').length : 0;
  return Math.max(2, Math.ceil(wordCount / 220));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const news = await NewsService.getNewsBySlug(slug);
    if (!news) return { title: 'Intelligence Not Found' };
    const author = await getNewsAuthorById(news.author_id || 'system');

    const publishedDate = news.published_at || news.created_at;
    const imageUrl = news.cover_image || `${BRAND_URL}/og-news.png`;

    return {
      title: `${news.title} | Terai Times News`,
      description: news.summary,
      alternates: {
        canonical: `${BRAND_URL}/news/${slug}`,
      },
      openGraph: {
        title: news.title,
        description: news.summary,
        url: `${BRAND_URL}/news/${slug}`,
        type: 'article',
        publishedTime: publishedDate,
        authors: [author.name || 'Refectl Intelligence Agency'],
        siteName: 'Terai Times',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: news.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: news.title,
        description: news.summary,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Terai Times News' };
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let news = null;
  let trendingNews: any[] = [];
  let author = { authorId: 'system', name: 'Refectl Intelligence Agency', role: 'News Desk' } as any;

  try {
    news = await NewsService.getNewsBySlug(slug);
    trendingNews = await NewsService.getTrendingNews(8);
    if (news?.author_id) {
      author = await getNewsAuthorById(news.author_id);
    }
  } catch (err) {
    console.error(err);
  }

  if (!news) notFound();

  const readMinutes = estimateReadMinutes(news.content || '');
  const related = trendingNews.filter((n: any) => n.id !== news.id);

  return (
    <AdBlockerDetector>
      <div className="news-page-shell min-h-screen pb-16">
        <NewsNavbar />

        <Script
          id="news-article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: news.title,
              description: news.summary,
              image: news.cover_image || `${BRAND_URL}/og-news.png`,
              datePublished: news.published_at || news.created_at,
              dateModified: news.updated_at || news.published_at || news.created_at,
              author: {
                '@type': 'Person',
                name: author.name || 'Refectl Intelligence Agency',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Terai Times',
                url: BRAND_URL,
                logo: {
                  '@type': 'ImageObject',
                  url: `${BRAND_URL}/logo.png`,
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${BRAND_URL}/news/${slug}`,
              },
            }),
          }}
        />

        <main className="container mx-auto px-4 pt-7 md:pt-10">
          <div className="news-detail-layout">
            <article className="news-article">
              <header className="news-article-head">
                <div className="news-article-strap">
                  <span className="news-kicker">{news.category || 'General'} Intelligence</span>
                  <span className="news-meta-dot">•</span>
                  <span>{news.country || 'Global'} Desk</span>
                </div>

                <h1 className="news-article-title">{news.title}</h1>

                <div className="news-article-meta">
                  <div className="news-article-author">
                    <div className="news-article-badge">TT</div>
                    <div>
                      <p>
                        <Link href={`/news/author/${encodeURIComponent(author.authorId || 'system')}`} className="hover:text-red-700 transition-colors">
                          {author.name || 'Refectl Intelligence Agency'}
                        </Link>
                      </p>
                      <p>{formatDate(news.published_at || news.created_at)}</p>
                    </div>
                  </div>
                  <div className="news-article-stats">
                    <span>
                      <Clock3 size={14} />
                      {readMinutes} min read
                    </span>
                    <span>
                      <Globe2 size={14} />
                      Verified Desk
                    </span>
                    <button type="button">
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </div>

                <p className="news-article-summary">
                  {news.summary || 'Strategic reporting and market context from the Terai Times newsroom.'}
                </p>
              </header>

              {news.cover_image ? (
                <section className="news-article-cover">
                  <div className="news-article-cover-media">
                    <NewsImage src={news.cover_image} alt={news.title} className="w-full h-full" />
                  </div>
                  <p className="news-article-caption">
                    Visual intelligence asset | Source: Terai Times Bureau
                  </p>
                </section>
              ) : null}

              <section className="news-article-body">
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              </section>

              <footer className="news-article-footer">
                <div className="news-tag-list">
                  {(news.tags || []).map((tag: string) => (
                    <span key={tag} className="news-tag-item">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link href="/news" className="news-back-link">
                  <ArrowLeft size={14} />
                  Back to News
                </Link>
              </footer>

              <CommentsGate slug={news.slug} />
            </article>

            <aside className="news-detail-rail">
              <section className="news-rail-card">
                <h3 className="news-rail-title">
                  <TrendingUp size={15} />
                  Market Momentum
                </h3>
                <div className="news-rail-list">
                  {related.slice(0, 6).map((n: any, idx: number) => (
                    <Link key={n.id} href={`/news/${n.slug}`} className="news-rail-item">
                      <span className="news-rail-rank">{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="news-rail-tag">{n.category || 'General'}</p>
                        <p className="news-rail-headline">{n.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="news-subscribe-panel">
                <p className="news-kicker">Daily Briefing</p>
                <h3>Stay Ahead of Global Signals.</h3>
                <p>Receive high-value intelligence summaries, market pulse reports, and strategic updates.</p>
                <Link href="/news/subscribe" className="news-subscribe-btn">
                  Join the Intelligence Network
                </Link>
              </section>

              <section className="news-quick-list">
                <h3 className="news-rail-title">
                  <Clock3 size={15} />
                  Rapid Scan
                </h3>
                <div className="space-y-3">
                  {related.slice(0, 4).map((n: any) => (
                    <Link key={n.id} href={`/news/${n.slug}`} className="news-quick-item">
                      <div className="news-quick-thumb">
                        <NewsImage src={n.cover_image || '/news-placeholder.jpg'} alt={n.title} className="w-full h-full" />
                      </div>
                      <div>
                        <p className="news-rail-headline">{n.title}</p>
                        <p className="news-rail-tag mt-1">
                          {n.country || 'Global'} • {formatDate(n.published_at || n.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </AdBlockerDetector>
  );
}
