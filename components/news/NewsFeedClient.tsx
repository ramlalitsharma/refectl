'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Activity, ArrowUpRight, Clock3, Globe2, Newspaper, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { NewsImage } from '@/components/news/NewsImage';
import { EventItem, EventShowcase } from '@/components/news/EventShowcase';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  country?: string;
  author_id?: string;
  cover_image?: string;
  created_at?: string;
  published_at?: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  market_entities?: string[];
  impact_score?: number;
};

function safeDate(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatPublishedDate(item: NewsItem): string {
  return format(safeDate(item.published_at || item.created_at), 'MMMM dd, yyyy');
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
  if (sentiment === 'Bullish') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-widest dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <TrendingUp size={10} /> Bullish
      </span>
    );
  }
  if (sentiment === 'Bearish') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 text-[9px] font-black uppercase tracking-widest dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800">
        <TrendingDown size={10} /> Bearish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <Minus size={10} /> Neutral
    </span>
  );
}


export function NewsFeedClient({
  category = 'All',
  country = 'All',
  initialItems = [],
  initialTrending = [],
  initialEvents = [],
}: {
  category?: string;
  country?: string;
  initialItems?: NewsItem[];
  initialTrending?: NewsItem[];
  initialEvents?: EventItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'All') params.delete(key);
    else params.set(key, val);
    router.push(`${pathname}?${params.toString()}`);
  };

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
    <div className="news-layout-shell mt-0">
      <section className="space-y-8 mt-0">

        {/* Cinematic Elite Hero Section */}
        {category === 'All' && country === 'All' && (
          <div className="news-hero-container">
            <IntelligenceMap />
            <div className="news-hero-card group">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-elite-accent-cyan/10 border border-elite-accent-cyan/20 rounded-full">
                  <span className="w-2 h-2 bg-elite-accent-cyan rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-elite-accent-cyan">Neural News Hub Active</span>
                </div>
                <Link href={`/news/${lead.slug}`}>
                  <h1 className="news-hero-title hover:text-elite-accent-cyan transition-colors duration-500 cursor-pointer uhd-text-shadow">
                    {lead.title}
                  </h1>
                </Link>
                <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-2xl">
                  {lead.summary || 'Global intelligence network processing real-time signals for deep strategic context.'}
                </p>
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <Link href={`/news/${lead.slug}`}>
                    <button className="px-10 py-5 bg-elite-accent-cyan text-black font-black uppercase tracking-tighter text-sm rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] group-hover:scale-105 duration-500">
                      Access Intelligence Matrix →
                    </button>
                  </Link>
                  <div className="flex items-center gap-5 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl transition-all duration-700 hover:bg-white/10 hover:border-white/20">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Market Sentiment</span>
                      <SentimentBadge sentiment={lead.sentiment || 'Neutral'} />
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Intel Impact</span>
                      <span className="text-base font-black text-elite-accent-cyan uhd-text-glow-cyan">{lead.impact_score || 75}<span className="text-[10px] text-slate-600 ml-0.5">/100</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="news-hero-visual group-hover:rotate-1 group-hover:scale-[1.02] transition-transform duration-1000">
                <NewsImage src={lead.cover_image || '/news-placeholder.jpg'} alt={lead.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="intel-signal-line" />
                <div className="absolute bottom-10 left-10 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-elite-accent-cyan/20 backdrop-blur-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                    <Globe2 size={24} className="text-elite-accent-cyan uhd-text-glow-cyan" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-1">{lead.country || 'Global'}</p>
                    <p className="text-[10px] text-elite-accent-cyan font-black uppercase tracking-widest">{lead.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tickerItems.length ? (
          <div className="news-ticker-shell">
            <span className="news-ticker-label">Breaking Wire</span>
            <div className="news-ticker-track">
              {tickerItems.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="news-ticker-item">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="news-filter-ribbon uhd-text-shadow">
          <div className="news-filter-select-wrapper">
            <Globe2 size={14} className="text-elite-accent-cyan" />
            <select
              className="news-filter-select"
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="All">Intelligence Verticals</option>
              <option value="World">World</option>
              <option value="Politics">Politics</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Environment">Environment</option>
              <option value="Culture">Culture</option>
              <option value="Health">Health</option>
              <option value="Opinion">Opinion</option>
            </select>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="news-filter-select-wrapper">
            <Activity size={14} className="text-red-600 animate-pulse" />
            <select
              className="news-filter-select"
              value={country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="All">Global Coverage</option>
              <option value="Global">Global</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Nepal">Nepal</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="Canada">Canada</option>
              <option value="Japan">Japan</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="UAE">UAE</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-elite-accent-cyan/10 border border-elite-accent-cyan/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-elite-accent-cyan rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase text-elite-accent-cyan tracking-widest">Real-time Node</span>
            </div>
          </div>
        </div>

        <section className="news-intel-grid gap-4">
          <div className="news-intel-card group hover:border-elite-accent-cyan transition-all duration-500">
            <p>Published Reports</p>
            <h3 className="group-hover:text-elite-accent-cyan transition-colors">{items.length}</h3>
            <span>Active in current filter</span>
          </div>
          <div className="news-intel-card group hover:border-elite-accent-purple transition-all duration-500">
            <p>Coverage Countries</p>
            <h3 className="group-hover:text-elite-accent-purple transition-colors">{uniqueCountryCount}</h3>
            <span>Regional intelligence network</span>
          </div>
          <div className="news-intel-card group hover:border-elite-accent-emerald transition-all duration-500">
            <p>Live Categories</p>
            <h3 className="group-hover:text-elite-accent-emerald transition-colors">{uniqueCategoryCount}</h3>
            <span>Editorial verticals online</span>
          </div>
          <div className="news-intel-card group hover:border-red-600 transition-all duration-500">
            <p>Newsroom Signal</p>
            <h3 className="news-intel-live group-hover:text-red-400 transition-colors">
              <Activity size={18} />
              High
            </h3>
            <span>Continuous verification desk</span>
          </div>
        </section>

        <div className="news-top-stories-grid">
          {/* Main Lead Slot - Hidden when hero is active to avoid redundancy */}
          {!(category === 'All' && country === 'All') && (
            <Link href={`/news/${lead.slug}`} className="news-lead-slot news-lead-card group">
              <div className="news-lead-media">
                <NewsImage src={lead.cover_image || '/news-placeholder.jpg'} alt={lead.title} className="w-full h-full" />
                <div className="news-lead-overlay" />
              </div>
              <div className="news-lead-content">
                <span className="news-kicker">Lead Story</span>
                <h1 className="news-lead-title">{lead.title}</h1>
                <p className="news-lead-summary">{lead.summary || 'In-depth coverage from our editorial intelligence desk.'}</p>
                <div className="news-meta-row mt-auto pt-4">
                  <span className="flex items-center gap-1">
                    {lead.author_id?.includes('bot') ? (
                      <>
                        <Zap size={12} className="text-red-500 fill-red-500" />
                        <span className="text-[10px] font-black uppercase text-red-500">Global Intel</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize">Staff Report</span>
                    )}
                  </span>
                  <span className="news-meta-dot">•</span>
                  <span>{lead.category || 'General'}</span>
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
                  <span className="news-meta-dot">•</span>
                  <span>{lead.country || 'Global'}</span>
                  <span className="news-meta-dot">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={13} />
                    {formatPublishedDate(lead)}
                  </span>
                  <span className="news-open-link">
                    Read Analysis <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Secondary Stacked Slots */}
          {second ? (
            <Link href={`/news/${second.slug}`} className="news-second-slot news-second-story group">
              <div className="news-second-text">
                <span className="news-kicker">Top Development</span>
                <div className="flex gap-2 items-center mt-1">
                  <h2 className="news-second-title m-0">{second.title}</h2>
                </div>
                <p className="news-second-summary line-clamp-2">
                  {second.summary || 'Key updates and verified insights from our newsroom.'}
                </p>
                <div className="news-second-meta flex items-center gap-2">
                  <span>{formatPublishedDate(second)}</span>
                  {second.sentiment && <SentimentBadge sentiment={second.sentiment} />}
                  {second.market_entities && second.market_entities.length > 0 && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase">[{second.market_entities[0]}]</span>
                  )}
                </div>
              </div>
              <div className="news-second-media">
                <NewsImage src={second.cover_image || '/news-placeholder.jpg'} alt={second.title} className="w-full h-full" />
              </div>
            </Link>
          ) : null}

          {third ? (
            <Link href={`/news/${third.slug}`} className="news-third-slot news-second-story group">
              <div className="news-second-text">
                <span className="news-kicker">Developing</span>
                <div className="flex gap-2 items-center mt-1">
                  <h2 className="news-second-title m-0">{third.title}</h2>
                </div>
                <p className="news-second-summary line-clamp-2">
                  {third.summary || 'Emerging stories tracked by global intelligence.'}
                </p>
                <div className="news-second-meta flex items-center gap-2">
                  <span>{formatPublishedDate(third)}</span>
                  {third.sentiment && <SentimentBadge sentiment={third.sentiment} />}
                  {third.market_entities && third.market_entities.length > 0 && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase">[{third.market_entities[0]}]</span>
                  )}
                </div>
              </div>
              <div className="news-second-media">
                <NewsImage src={third.cover_image || '/news-placeholder.jpg'} alt={third.title} className="w-full h-full" />
              </div>
            </Link>
          ) : null}
        </div>

        <EventShowcase items={events} />

        {automatedBriefings.length ? (
          <section className="news-ai-showcase">
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
        ) : null}

        {editorPicks.length ? (
          <section>
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
        ) : null}

        {categoryPulse.length ? (
          <section className="news-pulse-strip">
            {categoryPulse.map((pill) => (
              <Link key={pill.label} href={`/news?category=${encodeURIComponent(pill.label)}`} className="news-pulse-pill">
                <span>{pill.label}</span>
                <strong>{pill.count}</strong>
              </Link>
            ))}
          </section>
        ) : null}

        {latestReports.length ? (
          <section>
            <div className="news-section-head">
              <h2>Latest Reports</h2>
              <span>Fast updates with context</span>
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
                    <div className="news-second-meta flex items-center gap-2 mt-2">
                      <span>{formatPublishedDate(item)}</span>
                      {item.sentiment && <SentimentBadge sentiment={item.sentiment} />}
                      {item.market_entities && item.market_entities.length > 0 && (
                        <span className="text-[9px] text-slate-400 font-bold uppercase">[{item.market_entities[0]}]</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
      </section>

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
        </div>
      </aside>
    </div>
  );
}
