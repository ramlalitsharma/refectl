'use client';

import Link from 'next/link';
import { Globe2, Flag, CalendarDays } from 'lucide-react';

export type EventItem = {
  _id?: string;
  slug: string;
  title: string;
  summary?: string;
  scope: 'global' | 'country';
  country?: string;
  bannerLeftLabel?: string;
  bannerLeftValue?: string;
  bannerRightLabel?: string;
  bannerRightValue?: string;
  bannerCenterText?: string;
  badgeText?: string;
  metrics?: Array<{ label: string; value: string; cta?: string }>;
};

export function EventShowcase({ items, compact = false }: { items: EventItem[]; compact?: boolean }) {
  if (!items?.length) return null;
  const top = items[0];
  const hasCoreContent = Boolean(
    (top.title && top.title.trim()) ||
    (top.summary && top.summary.trim()) ||
    (top.bannerCenterText && top.bannerCenterText.trim()) ||
    (top.bannerLeftValue && top.bannerLeftValue.trim()) ||
    (top.bannerRightValue && top.bannerRightValue.trim())
  );
  if (!hasCoreContent) return null;
  const metrics = (top.metrics || []).slice(0, compact ? 3 : 4);

  return (
    <section className="space-y-3">
      <div
        className="rounded-2xl border border-slate-200 text-white overflow-hidden"
        style={{ backgroundColor: '#143b92' }}
      >
        <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-widest font-black text-blue-100">Special Event</p>
            <h3 className="text-xl md:text-2xl font-black leading-tight">{top.title}</h3>
            <p className="text-xs text-blue-100 line-clamp-2">{top.summary}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-sm font-black uppercase tracking-widest">{top.bannerCenterText || 'Live Update'}</p>
            <p className="text-[11px] mt-2 text-blue-100 inline-flex items-center gap-1 uppercase tracking-wider">
              {top.scope === 'global' ? <Globe2 size={12} /> : <Flag size={12} />}
              {top.scope === 'global' ? 'Global' : top.country || 'Country'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right md:text-left">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-blue-100">{top.bannerLeftLabel || 'Left'}</p>
              <p className="text-xl font-black">{top.bannerLeftValue || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-blue-100">{top.bannerRightLabel || 'Right'}</p>
              <p className="text-xl font-black">{top.bannerRightValue || '-'}</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 md:px-5 md:pb-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-black text-blue-100">
            <CalendarDays size={12} />
            Live Event Panel
          </span>
          <Link href={`/news/events/${top.slug}`} className="rounded-full bg-white text-[#143b92] px-4 py-1.5 text-[11px] font-black uppercase tracking-wider">
            {top.badgeText || 'Details'}
          </Link>
        </div>
      </div>

      {metrics.length ? (
        <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {metrics.map((m, idx) => (
            <div key={`${m.label}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-black">{m.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{m.value}</p>
              {m.cta ? <p className="text-xs text-slate-600 mt-2">{m.cta}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
