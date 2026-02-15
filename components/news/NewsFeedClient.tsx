'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, ArrowUpRight, Clock3, Globe2, Newspaper, TrendingUp } from 'lucide-react';
import { NewsImage } from '@/components/news/NewsImage';
import { EventItem, EventShowcase } from '@/components/news/EventShowcase';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  country?: string;
  cover_image?: string;
  created_at?: string;
  published_at?: string;
};

function safeDate(value?: string): Date {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatPublishedDate(item: NewsItem): string {
  return format(safeDate(item.published_at || item.created_at), 'MMMM dd, yyyy');
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
  const items = initialItems;
  const trending = initialTrending;
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

  const lead = items[0];
  const second = items[1];
  const editorPicks = useMemo(() => items.slice(2, 6), [items]);
  const latestReports = useMemo(() => items.slice(6), [items]);
  const trendList = trending.length ? trending.slice(0, 8) : items.slice(0, 8);
  const tickerItems = useMemo(() => (items.length ? items.slice(0, 8) : []), [items]);
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
      <div className="news-empty-shell">
        <Newspaper className="w-14 h-14 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900">No Published News Yet</h2>
        <p className="text-slate-600 mt-2">Publish an article in News Studio and refresh this page.</p>
      </div>
    );
  }

  return (
    <div className="news-layout-shell mt-0">
      <section className="space-y-8 mt-0">
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

        <div className="news-live-line">
          <span className="news-live-dot" />
          <span>Live Global Desk</span>
          <span className="news-live-separator">•</span>
          <span>{category === 'All' ? 'All Categories' : category}</span>
          <span className="news-live-separator">•</span>
          <span>{country === 'All' ? 'All Regions' : country}</span>
        </div>

        <section className="news-intel-grid">
          <div className="news-intel-card">
            <p>Published Reports</p>
            <h3>{items.length}</h3>
            <span>Active in current filter</span>
          </div>
          <div className="news-intel-card">
            <p>Coverage Countries</p>
            <h3>{uniqueCountryCount}</h3>
            <span>Regional intelligence network</span>
          </div>
          <div className="news-intel-card">
            <p>Live Categories</p>
            <h3>{uniqueCategoryCount}</h3>
            <span>Editorial verticals online</span>
          </div>
          <div className="news-intel-card">
            <p>Newsroom Signal</p>
            <h3 className="news-intel-live">
              <Activity size={18} />
              High
            </h3>
            <span>Continuous verification desk</span>
          </div>
        </section>

        <Link href={`/news/${lead.slug}`} className="news-lead-card group">
          <div className="news-lead-media">
            <NewsImage src={lead.cover_image || '/news-placeholder.jpg'} alt={lead.title} className="w-full h-full" />
            <div className="news-lead-overlay" />
          </div>
          <div className="news-lead-content">
            <span className="news-kicker">Lead Story</span>
            <h1 className="news-lead-title">{lead.title}</h1>
            <p className="news-lead-summary">{lead.summary || 'In-depth coverage from our editorial intelligence desk.'}</p>
            <div className="news-meta-row">
              <span>{lead.category || 'General'}</span>
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

        <EventShowcase items={events} />

        {second ? (
          <Link href={`/news/${second.slug}`} className="news-second-story group">
            <div className="news-second-text">
              <span className="news-kicker">Top Development</span>
              <h2 className="news-second-title">{second.title}</h2>
              <p className="news-second-summary">
                {second.summary || 'Key updates and verified insights from our newsroom.'}
              </p>
              <p className="news-second-meta">{formatPublishedDate(second)}</p>
            </div>
            <div className="news-second-media">
              <NewsImage src={second.cover_image || '/news-placeholder.jpg'} alt={second.title} className="w-full h-full" />
            </div>
          </Link>
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
                    <p className="news-second-meta">{formatPublishedDate(item)}</p>
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
              <Link key={item.id} href={`/news/${item.slug}`} className="news-rail-item">
                <span className="news-rail-rank">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <p className="news-rail-tag">{item.category || 'General'}</p>
                  <p className="news-rail-headline">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
