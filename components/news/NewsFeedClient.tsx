'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, ArrowUpRight, BarChart3, Bot, CalendarClock, Clock3, Globe2, Mail, Newspaper, ShieldCheck, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { NewsImage } from '@/components/news/NewsImage';
import { EventItem, EventShowcase } from '@/components/news/EventShowcase';
import { LiveNewsPulse } from '@/components/news/LiveNewsPulse';
import { NewsRailAdSlots } from '@/components/news/NewsRailAdSlots';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  content?: string;
  summary?: string;
  category?: string;
  country?: string;
  author_id?: string;
  cover_image?: string;
  created_at?: string;
  published_at?: string;
  source_url?: string;
  source_name?: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  market_entities?: string[];
  impact_score?: number;
};

type AutomationStatus = {
  autoPublishEnabled: boolean;
  targetPerHour: number;
  retentionDays: number;
  newsletterUtcHour: number;
  last24hAutomatedPublished: number | null;
  pendingApprovalCount: number | null;
  maintenanceMode: 'healthy' | 'degraded';
};

function safeDate(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatPublishedDate(item: NewsItem): string {
  return format(safeDate(item.published_at || item.created_at), 'MMMM dd, yyyy');
}

function resolveSourceLabel(item: NewsItem): string | null {
  if (item.source_name && item.source_name.trim()) return item.source_name.trim();
  if (item.source_url && /^https?:\/\//i.test(item.source_url)) {
    try {
      const parsed = new URL(item.source_url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }
  return null;
}

function resolveSourceHref(item: NewsItem): string | null {
  if (item.source_url && /^https?:\/\//i.test(item.source_url)) return item.source_url;
  return null;
}

function IntelligenceMap() {
  return (
    <div className="news-hero-background-map">
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        {/* Simplified Global Map Dots */}
        {[
          { x: 150, y: 150 }, { x: 250, y: 200 }, { x: 450, y: 120 },
          { x: 550, y: 180 }, { x: 750, y: 140 }, { x: 850, y: 250 },
          { x: 300, y: 350 }, { x: 600, y: 380 }, { x: 180, y: 400 },
          { x: 800, y: 420 }, { x: 500, y: 300 }, { x: 400, y: 250 }
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="2" className="map-node">
              <animate attributeName="r" values="2;4;2" dur={`${3 + i % 3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${3 + i % 3}s`} repeatCount="indefinite" />
            </circle>
            {/* Intel Links */}
            {i > 0 && (
              <line
                x1={node.x} y1={node.y}
                x2={1000 - node.x} y2={500 - node.y}
                className="map-link"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment?: 'Bullish' | 'Bearish' | 'Neutral' }) {
  if (!sentiment) return null;
  const styles = {
    Bullish: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Bearish: 'bg-red-500/10 text-red-500 border-red-500/20',
    Neutral: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };
  const Icons = {
    Bullish: TrendingUp,
    Bearish: TrendingDown,
    Neutral: Minus,
  };
  const Icon = Icons[sentiment];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${styles[sentiment]}`}>
      <Icon size={12} strokeWidth={2.5} />
      {sentiment}
    </span>
  );
}


export function NewsFeedClient({
  initialItems = [],
  initialTrending = [],
  initialEvents = [],
  automationStatus,
}: {
  category?: string;
  country?: string;
  initialItems?: NewsItem[];
  initialTrending?: NewsItem[];
  initialEvents?: EventItem[];
  automationStatus?: AutomationStatus;
}) {
  const items = useMemo(() => [...initialItems], [initialItems]);
  const trending = useMemo(() => [...initialTrending], [initialTrending]);
  const events = useMemo(
    () =>
      (initialEvents || []).filter(
        (e) =>
          Boolean((e?.title || '').trim()) ||
          Boolean((e?.summary || '').trim()) ||
          Boolean((e?.bannerCenterText || '').trim())
      ),
    [initialEvents]
  );

  const rankedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const impactA = typeof a.impact_score === 'number' ? a.impact_score : 0;
      const impactB = typeof b.impact_score === 'number' ? b.impact_score : 0;
      if (impactB !== impactA) return impactB - impactA;
      const dateA = safeDate(a.published_at || a.created_at).getTime();
      const dateB = safeDate(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });
  }, [items]);

  const lead = rankedItems[0];
  const second = rankedItems[1];
  const third = rankedItems[2];
  const editorPicks = useMemo(() => rankedItems.slice(3, 7), [rankedItems]);
  const latestReports = useMemo(() => rankedItems.slice(7), [rankedItems]);
  const automatedBriefings = useMemo(
    () => items.filter((item) => item.author_id?.toLowerCase().includes('bot')).slice(0, 6),
    [items]
  );
  const automatedLead = automatedBriefings[0];
  const automatedRest = automatedBriefings.slice(1);
  const trendList = trending.length ? trending.slice(0, 8) : rankedItems.slice(0, 8);
  const tickerItems = useMemo(() => (rankedItems.length ? rankedItems.slice(0, 8) : []), [rankedItems]);
  const commandDeck = useMemo(() => rankedItems.slice(0, 5), [rankedItems]);
  const uniqueCountryCount = useMemo(
    () => new Set(items.map((item) => item.country || 'Global')).size,
    [items]
  );
  const uniqueCategoryCount = useMemo(
    () => new Set(items.map((item) => item.category || 'General')).size,
    [items]
  );

  const categoryPulse = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const key = item.category || 'General';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [items]);

  const marketPulse = useMemo(() => {
    const withImpact = rankedItems.filter((n) => typeof n.impact_score === 'number') as (NewsItem & { impact_score: number })[];
    const avgImpact = withImpact.length
      ? Math.round(withImpact.reduce((acc, n) => acc + (n.impact_score || 0), 0) / withImpact.length)
      : null;
    const entities = new Map<string, number>();
    for (const item of rankedItems) {
      for (const e of item.market_entities || []) {
        entities.set(e, (entities.get(e) || 0) + 1);
      }
    }
    const topEntities = Array.from(entities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
    return { avgImpact, topEntities };
  }, [rankedItems]);

  const regionalSpotlights = useMemo(() => {
    const seen = new Set<string>();
    const picks: NewsItem[] = [];
    for (const item of rankedItems) {
      const country = (item.country || 'Global').trim();
      if (!country || country === 'Global' || seen.has(country)) continue;
      seen.add(country);
      picks.push(item);
      if (picks.length === 4) break;
    }
    return picks;
  }, [rankedItems]);

  const strategicBriefings = useMemo(() => {
    return rankedItems
      .filter((item) => (item.impact_score || 0) >= 70 || item.author_id?.toLowerCase().includes('bot'))
      .slice(0, 4);
  }, [rankedItems]);

  const hubLinks = useMemo(() => {
    const categoryLinks = categoryPulse.slice(0, 4).map((pill) => ({
      label: pill.label,
      href: `/news?category=${encodeURIComponent(pill.label)}`,
      count: pill.count,
      type: 'Desk',
    }));
    const countryLinks = regionalSpotlights.slice(0, 3).map((item) => ({
      label: item.country || 'Global',
      href: `/news?country=${encodeURIComponent(item.country || 'Global')}`,
      count: typeof item.impact_score === 'number' ? item.impact_score : null,
      type: 'Region',
    }));
    return [...categoryLinks, ...countryLinks].slice(0, 7);
  }, [categoryPulse, regionalSpotlights]);

  const leadSourceLabel = lead ? resolveSourceLabel(lead) : null;
  const leadSourceHref = lead ? resolveSourceHref(lead) : null;
  if (!lead) {
    return (
      <div className="news-hero-container">
        <IntelligenceMap />
        <div className="news-hero-card flex flex-col items-center justify-center text-center">
          <Newspaper className="w-20 h-20 text-elite-accent-cyan mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl font-black text-white">Intelligence Matrix Offline</h2>
          <p className="text-slate-400 mt-4 max-w-md">The news swarm is currently re-calibrating. Check back shortly for real-time global insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-layout-shell">
      <section className="news-primary-flow mt-0">

        <div className="news-live-pulse-row">
          <LiveNewsPulse />
        </div>

        {tickerItems.length ? (
          <div className="news-ticker-shell">
            <span className="news-ticker-label">Breaking Wire</span>
            <div className="news-ticker-track">
              {/* Double items for seamless loop */}
              {[...tickerItems, ...tickerItems].map((item, idx) => (
                <a key={`${item.id}-${idx}`} href={`/news/${item.slug}`} className="news-ticker-item">
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <section className="px-4 md:px-6 2xl:px-8 py-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[32px] border border-[var(--news-border-strong)] bg-[radial-gradient(circle_at_top_left,rgba(192,20,46,0.12),transparent_32%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(15,23,42,0.84))] px-6 py-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] md:px-8 md:py-9">
              <div className="absolute inset-0 opacity-20">
                <IntelligenceMap />
              </div>
              <div className="relative z-10 max-w-3xl">
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/60">Terai Times Command Center</p>
                <h2 className="mt-4 max-w-2xl font-sans text-[clamp(2.2rem,4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-balance">
                  A flagship news front page built for readers, executives, and search dominance.
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/72 md:text-[16px]">
                  Live reporting, premium analysis, fast-moving AI briefings, and regional intelligence organized into a page that behaves like a newsroom product, not a blog feed.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={lead ? `/news/${lead.slug}` : '/news'} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-slate-950 transition-transform hover:-translate-y-0.5">
                    Read Lead Story <ArrowUpRight size={14} />
                  </Link>
                  <Link href="/news/subscribe" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white/88 transition-colors hover:border-white/50 hover:bg-white/8">
                    Join Daily Pulse
                  </Link>
                </div>
                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Live Coverage</p>
                    <strong className="mt-1 block text-2xl font-black">{items.length}</strong>
                    <span className="text-[12px] text-white/65">stories currently on the page</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Global Reach</p>
                    <strong className="mt-1 block text-2xl font-black">{uniqueCountryCount}</strong>
                    <span className="text-[12px] text-white/65">countries represented</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Market Signal</p>
                    <strong className="mt-1 block text-2xl font-black">{marketPulse.avgImpact !== null ? `${marketPulse.avgImpact}/100` : 'Live'}</strong>
                    <span className="text-[12px] text-white/65">average impact across current reports</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-[var(--news-border-strong)] bg-[var(--news-card-bg)] p-5 shadow-[var(--news-shadow)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--news-border)] pb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--news-text-subtle)]">Frontline Now</p>
                    <h3 className="mt-1 text-lg font-black text-[var(--news-text)]">Command Deck</h3>
                  </div>
                  <span className="rounded-full bg-[var(--news-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--news-accent)]">
                    Real-Time
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {commandDeck.map((item, idx) => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="group flex items-start gap-3 rounded-2xl border border-transparent px-2 py-2 transition-all hover:border-[var(--news-border-strong)] hover:bg-[var(--news-card-hover)]">
                      <span className="mt-0.5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--news-accent)]">{String(idx + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--news-text-subtle)]">
                          {item.category || 'General'} • {item.country || 'Global'}
                        </p>
                        <h4 className="mt-1 line-clamp-2 text-[15px] font-black leading-5 text-[var(--news-text)] group-hover:text-[var(--news-accent)]">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--news-border-strong)] bg-[var(--news-card-bg)] p-5 shadow-[var(--news-shadow-sm)]">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--news-text-subtle)]">Growth Surface</p>
                <h3 className="mt-1 text-lg font-black text-[var(--news-text)]">SEO and Revenue Hubs</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hubLinks.map((hub) => (
                    <Link key={`${hub.type}-${hub.label}`} href={hub.href} className="rounded-full border border-[var(--news-border-strong)] bg-[var(--news-surface)] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--news-text)] transition-colors hover:border-[var(--news-accent)] hover:text-[var(--news-accent)]">
                      {hub.type}: {hub.label} {hub.count ? `· ${hub.count}` : ''}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intel Stats */}
        <section className="px-4 md:px-6 2xl:px-8 py-4 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
          <div className="news-intel-grid">
            <div className="news-intel-card group">
              <p>Published Reports</p>
              <h3>{items.length}</h3>
              <span>Active in current filter</span>
            </div>
            <div className="news-intel-card group">
              <p>Coverage Countries</p>
              <h3>{uniqueCountryCount}</h3>
              <span>Regional intelligence network</span>
            </div>
            <div className="news-intel-card group">
              <p>Live Categories</p>
              <h3>{uniqueCategoryCount}</h3>
              <span>Editorial verticals online</span>
            </div>
            <div className="news-intel-card group">
              <p>Newsroom Signal</p>
              <h3 className="news-intel-live">
                <Activity size={18} />
                High
              </h3>
              <span>Continuous verification desk</span>
            </div>
            <div className="news-intel-card group relative overflow-hidden">
              <p>Automation Status</p>
              <h3 className={automationStatus?.maintenanceMode === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}>
                {automationStatus?.maintenanceMode === 'healthy' ? 'Live' : 'Limited'}
              </h3>
              <span>
                {automationStatus
                  ? `${automationStatus.last24hAutomatedPublished ?? '-'} auto, ${automationStatus.pendingApprovalCount ?? '-'} pending`
                  : 'Loading status'}
              </span>
            </div>
          </div>
        </section>

        {/* Hero Stories - full-bleed */}
        <div className="news-top-stories-grid">

          <Link href={`/news/${lead.slug}`} className="news-lead-slot news-lead-card group">
            <div className="news-lead-media">
              <NewsImage src={lead.cover_image || '/news-placeholder.jpg'} alt={lead.title} className="w-full h-full" />
              <div className="news-lead-overlay" />
            </div>
            <div className="news-lead-content">
              <div className="news-lead-header">
                <span className="news-kicker">Lead Story</span>
                <h1 className="news-lead-title">{lead.title}</h1>
              </div>
              <p className="news-lead-summary">{lead.summary || 'In-depth coverage from our editorial intelligence desk.'}</p>
              <div className="news-meta-row mt-auto pt-4">
                <span className="flex items-center gap-1.5">
                  {lead.author_id?.includes('bot') ? (
                    <>
                      <Zap size={10} className="text-red-500 fill-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-tighter text-red-500">Global Intel</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Staff Report</span>
                  )}
                </span>
                <span className="news-meta-dot opacity-40">•</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">{lead.category || 'General'}</span>
                {lead.sentiment && (
                  <>
                    <span className="news-meta-dot">•</span>
                    <SentimentBadge sentiment={lead.sentiment} />
                  </>
                )}
                {lead.market_entities && lead.market_entities.length > 0 && (
                  <>
                    <span className="news-meta-dot">•</span>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                      [{lead.market_entities.slice(0, 2).join(', ')}]
                    </span>
                  </>
                )}
                <span className="news-meta-dot opacity-40">•</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">{lead.country || 'Global'}</span>
                {leadSourceLabel && (
                  <>
                    <span className="news-meta-dot opacity-40">•</span>
                    <span className="news-source-inline">
                      <Globe2 size={11} />
                      {leadSourceHref ? (
                        <a href={leadSourceHref} target="_blank" rel="noopener noreferrer" className="news-source-link">
                          Source: {leadSourceLabel}
                        </a>
                      ) : (
                        <span>Source: {leadSourceLabel}</span>
                      )}
                    </span>
                  </>
                )}
                <span className="news-meta-dot opacity-40">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                  <Clock3 size={11} strokeWidth={2.5} />
                  {formatPublishedDate(lead)}
                </span>
                <span className="news-meta-dot opacity-40">•</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-elite-accent-cyan">
                  {Math.max(1, Math.ceil((lead.content?.length || 500) / 1000))} min read
                </span>
                <span className="news-open-link">
                  Read Analysis <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </Link>

          {/* Secondary Stacked Slots */}
          {
            second ? (
              <Link href={`/news/${second.slug}`} className="news-second-slot news-second-story group">
                <div className="news-second-media">
                  <NewsImage src={second.cover_image || '/news-placeholder.jpg'} alt={second.title} className="w-full h-full" />
                </div>
                <div className="news-second-text">
                  <div className="flex flex-col gap-2">
                    <span className="news-kicker">Top Development</span>
                    <h2 className="news-second-title line-clamp-3">{second.title}</h2>
                  </div>
                  <p className="news-second-summary">
                    {second.summary || 'Key updates and verified insights from our newsroom.'}
                  </p>
                  <div className="news-second-meta">
                    <span className="news-meta-date">{formatPublishedDate(second)}</span>
                    {second.sentiment && <SentimentBadge sentiment={second.sentiment} />}
                    {second.market_entities && second.market_entities.length > 0 && (
                      <span className="news-meta-entity">[{second.market_entities[0]}]</span>
                    )}
                    {resolveSourceLabel(second) && (
                      <span className="news-source-inline">
                        <Globe2 size={11} />
                        {resolveSourceLabel(second)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ) : null
          }

          {
            third ? (
              <Link href={`/news/${third.slug}`} className="news-third-slot news-second-story group">
                <div className="news-second-media">
                  <NewsImage src={third.cover_image || '/news-placeholder.jpg'} alt={third.title} className="w-full h-full" />
                </div>
                <div className="news-second-text">
                  <div className="flex flex-col gap-2">
                    <span className="news-kicker">Developing</span>
                    <h2 className="news-second-title line-clamp-3">{third.title}</h2>
                  </div>
                  <p className="news-second-summary">
                    {third.summary || 'Emerging stories tracked by global intelligence.'}
                  </p>
                  <div className="news-second-meta">
                    <span className="news-meta-date">{formatPublishedDate(third)}</span>
                    {third.sentiment && <SentimentBadge sentiment={third.sentiment} />}
                    {third.market_entities && third.market_entities.length > 0 && (
                      <span className="news-meta-entity">[{third.market_entities[0]}]</span>
                    )}
                    {resolveSourceLabel(third) && (
                      <span className="news-source-inline">
                        <Globe2 size={11} />
                        {resolveSourceLabel(third)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ) : null
          }
        </div >

        <section className="px-4 md:px-6 2xl:px-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
          <EventShowcase items={events} />
        </section>

        {
          automatedBriefings.length ? (
            <section className="news-ai-showcase px-4 md:px-6 2xl:px-8 py-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
              <div className="news-section-head">
                <h2>Automated Intelligence Briefings</h2>
                <span>Hourly AI desk updates with premium global newsroom layout</span>
              </div>
              <div className="news-ai-grid">
                {automatedLead ? (
                  <Link href={`/news/${automatedLead.slug}`} className="news-ai-lead group">
                    <div className="news-ai-lead-media">
                      <NewsImage src={automatedLead.cover_image || '/news-placeholder.jpg'} alt={automatedLead.title} className="w-full h-full" />
                      <div className="news-ai-lead-overlay" />
                    </div>
                    <div className="news-ai-lead-body">
                      <p className="news-pick-tag">
                        <Zap size={12} className="inline-block mr-1 text-red-500" />
                        AI Lead Dispatch • {automatedLead.country || 'Global'} • {automatedLead.category || 'General'}
                      </p>
                      <h3 className="news-ai-lead-title">{automatedLead.title}</h3>
                      <p className="news-ai-lead-summary">{automatedLead.summary}</p>
                    </div>
                  </Link>
                ) : null}
                <div className="news-ai-side">
                  {automatedRest.map((item) => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="news-ai-card group">
                      <div className="news-ai-card-media">
                        <NewsImage src={item.cover_image || '/news-placeholder.jpg'} alt={item.title} className="w-full h-full" />
                      </div>
                      <div className="news-ai-card-body">
                        <p className="news-pick-tag">
                          <Zap size={10} className="inline-block mr-1 text-red-500" />
                          AI Desk • {item.category || 'General'}
                        </p>
                        <h4 className="news-ai-card-title">{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null
        }

        {
          editorPicks.length ? (
            <section className="px-4 md:px-6 2xl:px-8 py-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
              <div className="news-section-head">
                <h2>Editor Picks</h2>
                <span>Curated from our international desk</span>
              </div>
              <div className="news-picks-grid">
                {editorPicks.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="news-pick-card group">
                    <div className="news-pick-media">
                      <NewsImage src={item.cover_image || '/news-placeholder.jpg'} alt={item.title} className="w-full h-full" />
                    </div>
                    <div className="news-pick-body">
                      <p className="news-pick-tag">
                        {item.category || 'General'} • {item.country || 'Global'}
                      </p>
                      <h3 className="news-pick-title">{item.title}</h3>
                      <p className="news-pick-summary">{item.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null
        }

        {strategicBriefings.length ? (
          <section className="px-4 md:px-6 2xl:px-8 py-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[30px] border border-[var(--news-border-strong)] bg-[var(--news-card-bg)] p-5 shadow-[var(--news-shadow)] md:p-6">
                <div className="news-section-head !mb-4">
                  <h2>Strategic Briefings</h2>
                  <span>High-impact reads packaged for premium audience depth</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {strategicBriefings.map((item) => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="group rounded-[24px] border border-[var(--news-border)] bg-[var(--news-surface)] p-4 transition-all hover:-translate-y-1 hover:border-[var(--news-accent)] hover:shadow-[var(--news-shadow)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--news-accent)]">
                        {item.author_id?.toLowerCase().includes('bot') ? 'AI Briefing' : 'Desk Analysis'}
                      </p>
                      <h3 className="mt-2 line-clamp-3 text-[18px] font-black leading-6 text-[var(--news-text)] group-hover:text-[var(--news-accent)]">
                        {item.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-[var(--news-text-muted)]">
                        {item.summary || 'Premium brief with fast-moving updates, context, and implications.'}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--news-text-subtle)]">
                        <span>{item.country || 'Global'}</span>
                        <span>•</span>
                        <span>{item.category || 'General'}</span>
                        {typeof item.impact_score === 'number' ? (
                          <>
                            <span>•</span>
                            <span className="text-[var(--news-accent)]">Impact {item.impact_score}</span>
                          </>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[30px] border border-[var(--news-border-strong)] bg-[linear-gradient(180deg,rgba(192,20,46,0.05),transparent_55%),var(--news-card-bg)] p-5 shadow-[var(--news-shadow-sm)]">
                  <div className="news-section-head !mb-4">
                    <h2>Regional Spotlights</h2>
                    <span>One lead story per region for broader landing-page crawl depth</span>
                  </div>
                  <div className="space-y-3">
                    {regionalSpotlights.map((item) => (
                      <Link key={item.id} href={`/news/${item.slug}`} className="group flex items-center gap-3 rounded-2xl border border-[var(--news-border)] bg-[var(--news-surface)] p-3 transition-all hover:border-[var(--news-accent)]">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                          <NewsImage src={item.cover_image || '/news-placeholder.jpg'} alt={item.title} className="h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--news-accent)]">{item.country || 'Global'}</p>
                          <h3 className="line-clamp-2 text-[15px] font-black leading-5 text-[var(--news-text)] group-hover:text-[var(--news-accent)]">{item.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[30px] border border-[var(--news-border-strong)] bg-[var(--news-text)] px-5 py-6 text-white shadow-[var(--news-shadow)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/55">Publisher Growth Engine</p>
                  <h3 className="mt-2 text-[28px] font-black leading-none">Turn daily reporting into higher-value search and subscription sessions.</h3>
                  <p className="mt-3 text-[14px] leading-6 text-white/72">
                    The page now pushes readers toward desk hubs, region hubs, and newsletter conversion instead of leaving value trapped in a flat stream.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/news/subscribe" className="rounded-full bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">
                      Activate Newsletter Funnel
                    </Link>
                    <Link href="/news?category=Business" className="rounded-full border border-white/20 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                      Open Business Desk
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {
          categoryPulse.length ? (
            <section className="news-pulse-strip px-4 md:px-6 2xl:px-8">
              {categoryPulse.map((pill) => (
                <Link key={pill.label} href={`/news?category=${encodeURIComponent(pill.label)}`} className="news-pulse-pill">
                  <span>{pill.label}</span>
                  <strong>{pill.count}</strong>
                </Link>
              ))}
            </section>
          ) : null
        }

        {
          latestReports.length ? (
            <section className="px-4 md:px-6 2xl:px-8 py-8 border-b border-[var(--news-border,rgba(15,23,42,0.08))]">
              <div className="news-section-head">
                <h2>Latest Reports</h2>
                <span>Fast updates with verified context</span>
              </div>
              <div className="news-latest-list">
                {latestReports.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="news-latest-item group">
                    <div className="news-latest-media">
                      <NewsImage src={item.cover_image || '/news-placeholder.jpg'} alt={item.title} className="w-full h-full" />
                    </div>
                    <div className="news-latest-content">
                      <p className="news-pick-tag">
                        <Globe2 size={12} />
                        {item.country || 'Global'} • {item.category || 'General'}
                      </p>
                      <h3 className="news-latest-title">{item.title}</h3>
                      <p className="news-latest-summary">{item.summary}</p>
                      <div className="news-second-meta flex items-center gap-2 mt-auto pt-3 border-t border-slate-100/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatPublishedDate(item)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-elite-accent-cyan uppercase tracking-tighter">
                          {Math.max(1, Math.ceil((item.content?.length || 500) / 1000))} min read
                        </span>
                        {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
                        {resolveSourceLabel(item) && (
                          <span className="news-source-inline ml-auto">
                            <Globe2 size={11} />
                            {resolveSourceLabel(item)}
                          </span>
                        )}
                        {item.market_entities && item.market_entities.length > 0 && (
                          <span className="text-[9px] text-slate-400 font-bold uppercase ring-1 ring-slate-200 px-1 rounded-sm">
                            {item.market_entities[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null
        }

        <section className="news-brand-band">
          <p className="news-kicker">World-Class Editorial Network</p>
          <h3>Built for global readers, decision-makers, and live-event audiences.</h3>
          <div className="news-brand-links">
            <Link href="/news?category=World">World Desk</Link>
            <Link href="/news?category=Politics">Politics Desk</Link>
            <Link href="/news?category=Business">Business Desk</Link>
            <Link href="/news?country=Nepal">Nepal Focus</Link>
          </div>
        </section>

        <section className="news-conversion-panel">
          <div>
            <p className="news-kicker">Professional Briefing</p>
            <h3>Daily intelligence for decision-makers.</h3>
            <p>Get high-signal updates, verified analysis, and strategic context from Terai Times.</p>
          </div>
          <Link href="/news/subscribe" className="news-conversion-cta">
            Subscribe to Daily Pulse
          </Link>
        </section>
      </section >

      <aside className="news-rail">
        <div className="news-rail-card">
          <h3 className="news-rail-title">
            <TrendingUp size={15} />
            Trending
          </h3>
          <div className="news-rail-list">
            {trendList.map((item, idx) => (
              <Link key={item.id} href={`/news/${item.slug}`} className="news-rail-item group p-3 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all duration-300">
                <span className="news-rail-rank group-hover:text-elite-accent-cyan transition-colors duration-500">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="news-rail-tag group-hover:text-white transition-colors">{item.category || 'General'}</p>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {item.author_id?.includes('bot') ? 'Global Swarm' : 'Expert'}
                    </span>
                  </div>
                  <p className="news-rail-headline group-hover:text-elite-accent-cyan transition-colors duration-300">{item.title}</p>
                  <div className="news-rail-meta">
                    {typeof item.impact_score === 'number' ? (
                      <span className="news-rail-impact">Impact {item.impact_score}/100</span>
                    ) : null}
                    {item.sentiment ? <SentimentBadge sentiment={item.sentiment} /> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="news-rail-module">
            <h4 className="news-rail-module-title">
              <BarChart3 size={14} />
              Market Pulse
            </h4>
            <div className="news-rail-kv">
              <span>Avg Impact</span>
              <strong>{marketPulse.avgImpact !== null ? `${marketPulse.avgImpact}/100` : 'N/A'}</strong>
            </div>
            <div className="news-rail-kv">
              <span>Coverage</span>
              <strong>{uniqueCountryCount} Regions</strong>
            </div>
            {marketPulse.topEntities.length ? (
              <div className="news-rail-chip-row">
                {marketPulse.topEntities.map((entity) => (
                  <span key={entity} className="news-rail-chip">
                    {entity}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <NewsRailAdSlots />

          <div className="news-rail-module">
            <h4 className="news-rail-module-title">
              <Bot size={14} />
              Automation Monitor
            </h4>
            <div className="news-rail-kv">
              <span>Status</span>
              <strong className={automationStatus?.maintenanceMode === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}>
                {automationStatus?.maintenanceMode === 'healthy' ? 'Healthy' : 'Degraded'}
              </strong>
            </div>
            <div className="news-rail-kv">
              <span>Auto / 24h</span>
              <strong>{automationStatus?.last24hAutomatedPublished ?? 'N/A'}</strong>
            </div>
            <div className="news-rail-kv">
              <span>Pending Queue</span>
              <strong>{automationStatus?.pendingApprovalCount ?? 'N/A'}</strong>
            </div>
          </div>

          <div className="news-rail-module">
            <h4 className="news-rail-module-title">
              <CalendarClock size={14} />
              Events Radar
            </h4>
            <div className="news-rail-kv">
              <span>Live Events</span>
              <strong>{events.length}</strong>
            </div>
            <div className="news-rail-kv">
              <span>Briefing Cycle</span>
              <strong>Hourly</strong>
            </div>
          </div>

          <div className="news-rail-subscribe">
            <p className="news-rail-subscribe-kicker">Executive Briefing</p>
            <h4>Get the Daily Pulse before markets open.</h4>
            <p>High-signal global updates with verified context.</p>
            <div className="news-rail-subscribe-points">
              <span><ShieldCheck size={12} /> Verified Desk</span>
              <span><Mail size={12} /> Email Digest</span>
            </div>
            <Link href="/news/subscribe" className="news-rail-subscribe-cta">
              Subscribe
            </Link>
          </div>
        </div>
      </aside>
    </div >
  );
}
