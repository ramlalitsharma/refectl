import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Bookmark, Globe2, ArrowLeft, Share2, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { BRAND_URL } from '@/lib/brand';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { CommentsGate } from '@/components/news/CommentsGate';
import { NewsImage } from '@/components/news/NewsImage';
import { EngagementHubPanel } from '@/components/news/EngagementHubPanel';
import { TeraiTimesArticleService, TeraiTimesSeoService } from '@/modules/terai-times/backend/services';
import { extractTrustMetadata } from '@/lib/news-trust-metadata';
import { getPublicNewsTags, getRenderableNewsImage } from '@/lib/news-image-metadata';
import { GoogleAdUnit } from '@/components/news/GoogleAdUnit';
import { Bot, Zap, Activity, ShieldCheck, Lock } from 'lucide-react';

function formatDate(value?: string) {
  const d = value ? new Date(value) : new Date();
  return format(Number.isNaN(d.getTime()) ? new Date() : d, 'MMMM dd, yyyy');
}

function estimateReadMinutes(html: string): number {
  const plain = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plain ? plain.split(' ').length : 0;
  return Math.max(2, Math.ceil(wordCount / 220));
}

function resolveSourceLabel(sourceName?: string, sourceUrl?: string): string | null {
  if (sourceName && sourceName.trim()) return sourceName.trim();
  if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) {
    try {
      const parsed = new URL(sourceUrl);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }
  return null;
}

function resolveSourceHref(sourceUrl?: string): string | null {
  if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) return sourceUrl;
  return null;
}

function buildAuthorInitials(name?: string): string {
  const clean = String(name || 'Terai Times Bureau').trim();
  const parts = clean.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return 'TT';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'TT';
}

function cleanPresentationText(value?: string | null): string {
  return String(value || '')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function enhanceContentPresentation(html: string): string {
  if (!html) return '';
  if (html.includes('nda-dropcap')) return html;
  
  // Inject dropcap into the first <p> that has text
  let replaced = false;
  return html.replace(/<p>(.*?)<\/p>/g, (match, p1) => {
    if (replaced) return match;
    const stripped = p1.replace(/<[^>]+>/g, '').trim();
    if (!stripped) return match; // skip empty paragraphs
    
    // Find the first letter in the actual text content of p1
    replaced = true;
    return `<p>` + p1.replace(/^[ ]*([A-Za-z0-9"'])/, `<span class="nda-dropcap">$1</span>`) + `</p>`;
  });
}

export async function generateNewsDetailMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  const seo = new TeraiTimesSeoService();
  return seo.buildArticleMetadata(slug, locale);
}

export async function NewsDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const service = new TeraiTimesArticleService();

  let news = null;
  let related: any[] = [];
  let author = { authorId: 'system', name: 'Terai Times Bureau', role: 'News Desk' } as any;
  let engagement = null;
  let articleSchema: any = null;

  try {
    const payload = await service.getDetailPayload(slug);
    news = payload.news;
    related = payload.related;
    author = payload.author || author;
    engagement = payload.engagement || null;
    
    // SEO Phase 4: Fetch Structured Data
    const seo = new TeraiTimesSeoService();
    articleSchema = await seo.getArticleSchema(slug, locale);
  } catch (err) {
    console.error(err);
  }

  if (!news) notFound();

  const readMinutes = estimateReadMinutes(news.content || '');
  const sourceLabel = resolveSourceLabel(news.source_name, news.source_url);
  const sourceHref = resolveSourceHref(news.source_url);
  const trustMeta = extractTrustMetadata(news.tags || []);
  const heroImage = getRenderableNewsImage(news);
  const publicTags = getPublicNewsTags(news.tags || []);
  const authorName = author.name || 'Terai Times Bureau';
  const authorInitials = buildAuthorInitials(authorName);
  const categoryLabel = news.category || 'World';
  const countryLabel = news.country || 'Global';
  const standfirst = cleanPresentationText(news.summary) || 'Premium analysis and verified developments from the Terai Times global desk.';

  return (
    <div className="news-page-shell news-paper-theme min-h-screen">
      <NewsNavbar />

      {articleSchema && (
        <script
          id="news-article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema),
          }}
        />
      )}

      {heroImage.src && (
        <section className="nda-hero">
          <div className="nda-hero-img">
            <NewsImage src={heroImage.src} alt={news.title} className="w-full h-full" />
          </div>
          <div className="nda-hero-scrim" />
          <div className="nda-hero-caption">
            {cleanPresentationText(heroImage.credit)}{heroImage.caption ? ` • ${cleanPresentationText(heroImage.caption)}` : ''}
          </div>
        </section>
      )}

      <main className="nda-main">
        <div className="nda-grid">
          <article className="nda-article">
            <div className="nda-breadcrumb">
              <Link href="/news" className="nda-breadcrumb-link">
                <ArrowLeft size={12} /> Back to News
              </Link>
              <span className="nda-breadcrumb-sep">/</span>
              <Link href={`/news?category=${encodeURIComponent(categoryLabel)}`} className="nda-breadcrumb-link">
                {categoryLabel}
              </Link>
              <span className="nda-breadcrumb-sep">/</span>
              <span className="nda-breadcrumb-current">{countryLabel}</span>
            </div>

            <div className="nda-kicker-row">
              <span className="nda-kicker">{categoryLabel}</span>
              <span className="nda-kicker-dot" />
              <span className="nda-desk">{countryLabel} Desk</span>
              {news.author_id?.includes('bot') ? (
                <>
                  <span className="nda-kicker-dot" />
                  <span className="nda-desk">AI-assisted reporting</span>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="nda-headline">{cleanPresentationText(news.title)}</h1>
              {(news.tags || []).includes('multi_source_verified') && (
                <span className="nda-verified-badge">Verified</span>
              )}
            </div>

            <p className="nda-standfirst">{standfirst}</p>

            <div className="nda-byline">
              <div className="nda-byline-left">
                <div className="nda-avatar">{authorInitials}</div>
                <div className="nda-byline-info">
                  <span className="nda-author-name">{authorName}</span>
                  <span className="nda-byline-role">{author.role || 'Global News Desk'}</span>
                </div>
              </div>
                <div className="nda-byline-meta">
                <span className="nda-byline-date">{formatDate(news.published_at || news.created_at)}</span>
                <span className="nda-meta-pill bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                   <Activity size={10} className="animate-pulse" />
                   {engagement?.networkAnalytics?.activeTerminals || 14} Active Terminals
                </span>
                <span className="nda-meta-pill">{readMinutes} min read</span>
                <button type="button" className="nda-share-btn" title="Save Article">
                  <Bookmark size={13} /> Save
                </button>
                <button type="button" className="nda-share-btn" title="Adjust Text Size">
                  Aa
                </button>
                <button type="button" className="nda-share-btn" title="Share">
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>

            {sourceLabel && (
              <div className="nda-source-bar">
                <span className="nda-source-label">Source</span>
                {sourceHref ? (
                  <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="nda-source-link">
                    {sourceLabel}
                  </a>
                ) : (
                  <span className="nda-source-text">{sourceLabel}</span>
                )}
              </div>
            )}

            {!heroImage.src && (
              <div className="nda-inline-cover">
                <NewsImage
                  src={heroImage.src || "/news-placeholder.jpg"}
                  alt={news.title}
                  className="w-full h-full"
                />
                <div className="nda-hero-caption">
                  {cleanPresentationText(heroImage.credit)}{heroImage.caption ? ` • ${cleanPresentationText(heroImage.caption)}` : ''}
                </div>
              </div>
            )}

            {news.summary && (
              <div className="bg-[#f9f9f9] dark:bg-[#111111] p-5 mb-8 font-sans w-full">
                <div className="border-b border-[#e0e0e0] dark:border-[#333] pb-2 mb-3">
                  <h3 className="font-bold text-[14px] text-[#111111] dark:text-white uppercase">Summary</h3>
                </div>
                <ul className="list-disc pl-5 text-[#333333] dark:text-gray-300 space-y-2 text-[15px] leading-relaxed marker:text-gray-400">
                  <li>{news.summary.split('.')[0]}.</li>
                  {news.summary.split('.').length > 1 && news.summary.split('.')[1].trim().length > 0 && <li>{news.summary.split('.')[1]}.</li>}
                </ul>
              </div>
            )}

            {/* Key Takeaways */}
            {news.summary && (
              <div className="nda-key-takeaways">
                <div className="nda-key-head">Key Takeaways</div>
                <ul>
                  {news.summary
                    .split('.')
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((point: string, idx: number) => (
                      <li key={`${point}-${idx}`}>{point}.</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="font-sans text-[#333333] dark:text-gray-300 mb-2">
              <strong>{news.country ? `${news.country.toUpperCase()}` : 'GLOBAL'} (Terai Times) - </strong>
            </div>

            {/* Phase 3: Revenue & Premium Gating */}
            {news.impact_score && news.impact_score > 85 ? (
              <div className="relative group/premium">
                <div 
                  className="nda-body blur-md select-none pointer-events-none transition-all group-hover/premium:blur-sm"
                  dangerouslySetInnerHTML={{ __html: enhanceContentPresentation(news.content) }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[var(--news-bg)] via-transparent to-transparent">
                  <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-24 p-8 max-w-md text-center shadow-2xl animate-in fade-in zoom-in duration-700">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                      <Lock className="text-slate-950" size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Locked Analysis</h3>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                      This is a high-impact intelligence report with a strategic score of <span className="text-amber-500 font-bold">{news.impact_score}/100</span>. Full access requires a premium intelligence membership.
                    </p>
                    <Link href="/news/subscribe" className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-colors shadow-lg">
                      <Zap size={14} className="fill-slate-950" />
                      Unlock Full Brief
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="nda-body"
                dangerouslySetInnerHTML={{ __html: enhanceContentPresentation(news.content) }}
              />
            )}

            {publicTags.length > 0 && (
              <div className="nda-tags">
                <span className="nda-tags-label">Topics</span>
                {publicTags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/news?category=${encodeURIComponent(tag)}`}
                    className="nda-tag"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <section className="nda-related-links">
                <div className="nda-key-head">Related Intelligence</div>
                <ul>
                  {related.slice(0, 5).map((item: any) => (
                    <li key={item.id}>
                      <Link href={`/news/${item.slug}`}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="nda-transparency">
              <Link href={`/api/transparency/${news.id}`} target="_blank" rel="noopener noreferrer">
                View Transparency Report
              </Link>
            </div>

            <CommentsGate slug={news.slug} />
          </article>

          <aside className="nda-rail">
            {related.length > 0 && (
              <section className="nda-rail-card">
                <h3 className="nda-rail-title">
                  <TrendingUp size={14} />
                  Related Stories
                </h3>
                <div className="nda-rail-list">
                  {related.slice(0, 6).map((n: any, idx: number) => (
                    <Link key={n.id} href={`/news/${n.slug}`} className="nda-rail-item group">
                      <span className="nda-rail-rank group-hover:text-[var(--news-accent)]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="nda-rail-text">
                        <span className="nda-rail-cat">{n.category || 'General'}</span>
                        <p className="nda-rail-headline group-hover:text-[var(--news-accent)]">
                          {n.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <GoogleAdUnit className="mb-6" adSlot="ad-article-sidebar" />
            <section className="nda-subscribe">
              <p className="nda-subscribe-kicker">Daily Briefing</p>
              <h3 className="nda-subscribe-title">Stay Ahead of Global Signals.</h3>
              <p className="nda-subscribe-body">
                High-signal intelligence summaries, market pulse reports, and strategic updates delivered daily.
              </p>
              <Link href="/news/subscribe" className="nda-subscribe-cta">
                Join the Intelligence Network
              </Link>
            </section>

            <section className="nda-rail-card !bg-transparent border-none !p-0 shadow-none">
              <h3 className="nda-rail-title mb-4">
                <Globe2 size={14} />
                Global Sectors
              </h3>
              <div className="flex flex-col gap-2">
                {['Geopolitics', 'Markets & Finance', 'Technology & AI', 'Global Trade', 'Energy & Climate'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/news?category=${encodeURIComponent(cat)}`}
                    className="group flex items-center justify-between p-3 rounded-lg border border-[var(--news-border)] bg-[var(--news-surface)] hover:border-[var(--news-accent)] transition-colors"
                  >
                    <span className="text-xs font-bold text-[var(--news-text)] tracking-wide group-hover:text-[var(--news-accent)] transition-colors">
                      {cat}
                    </span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-[var(--news-accent)] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main >

      {/* ── ENGAGEMENT HUB (Modular Footer) ───────────────────────────── */}
      <EngagementHubPanel engagement={engagement} />

    </div >
  );
}
