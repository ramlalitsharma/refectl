'use client';

import { useMemo, useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

type EventData = {
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  eventType?: string;
  scope?: 'global' | 'country';
  country?: string;
  status?: 'draft' | 'published';
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  bannerLeftLabel?: string;
  bannerLeftValue?: string;
  bannerRightLabel?: string;
  bannerRightValue?: string;
  bannerCenterText?: string;
  badgeText?: string;
  metrics?: Array<{ label: string; value: string; cta?: string }>;
  metaTitle?: string;
  metaDescription?: string;
};

function slugify(input: string) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function EventEditor({ initialData, mode }: { initialData?: EventData; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [eventType, setEventType] = useState(initialData?.eventType || 'special');
  const [scope, setScope] = useState<'global' | 'country'>(initialData?.scope || 'global');
  const [country, setCountry] = useState(initialData?.country || 'Nepal');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [priority, setPriority] = useState<number>(Number(initialData?.priority || 0));
  const [startsAt, setStartsAt] = useState(initialData?.startsAt || '');
  const [endsAt, setEndsAt] = useState(initialData?.endsAt || '');
  const [bannerLeftLabel, setBannerLeftLabel] = useState(initialData?.bannerLeftLabel || '');
  const [bannerLeftValue, setBannerLeftValue] = useState(initialData?.bannerLeftValue || '');
  const [bannerRightLabel, setBannerRightLabel] = useState(initialData?.bannerRightLabel || '');
  const [bannerRightValue, setBannerRightValue] = useState(initialData?.bannerRightValue || '');
  const [bannerCenterText, setBannerCenterText] = useState(initialData?.bannerCenterText || '');
  const [badgeText, setBadgeText] = useState(initialData?.badgeText || '');
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [metricsText, setMetricsText] = useState(
    (initialData?.metrics || [])
      .map((m) => `${m.label}|${m.value}|${m.cta || ''}`)
      .join('\n')
  );

  const effectiveSlug = useMemo(() => slug || slugify(title), [slug, title]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const metrics = metricsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, value, cta] = line.split('|').map((v) => (v || '').trim());
          return { label, value, cta: cta || undefined };
        })
        .filter((m) => m.label && m.value);

      const payload = {
        title,
        slug: effectiveSlug,
        summary,
        eventType,
        scope,
        country: scope === 'country' ? country : undefined,
        status,
        priority,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        bannerLeftLabel,
        bannerLeftValue,
        bannerRightLabel,
        bannerRightValue,
        bannerCenterText,
        badgeText,
        metrics,
        metaTitle,
        metaDescription,
      };

      const url = mode === 'create' ? '/api/admin/events' : `/api/admin/events/${initialData?._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save event');
      router.push('/admin/studio/events');
    } catch (err: any) {
      alert(err?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="min-h-screen bg-elite-bg text-slate-100 p-8 md:p-12 space-y-8">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={saving} className="bg-elite-accent-cyan text-black hover:bg-white font-black">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Event'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 glass-card-premium rounded-3xl border border-white/10 p-6 space-y-5">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {mode === 'create' ? 'Create Special Event' : 'Edit Special Event'}
          </h1>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="slug (auto if empty)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary"
            className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={bannerLeftLabel}
              onChange={(e) => setBannerLeftLabel(e.target.value)}
              placeholder="Left label (e.g. India)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={bannerLeftValue}
              onChange={(e) => setBannerLeftValue(e.target.value)}
              placeholder="Left value (e.g. 176/7)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Badge text"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={bannerCenterText}
              onChange={(e) => setBannerCenterText(e.target.value)}
              placeholder="Center result text"
              className="md:col-span-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={bannerRightLabel}
              onChange={(e) => setBannerRightLabel(e.target.value)}
              placeholder="Right label (e.g. Pakistan)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={bannerRightValue}
              onChange={(e) => setBannerRightValue(e.target.value)}
              placeholder="Right value (e.g. 114/10)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          <textarea
            value={metricsText}
            onChange={(e) => setMetricsText(e.target.value)}
            placeholder={'Metrics lines: Label|Value|CTA\nCandidates|3406|All Candidates\nParties|68|All Parties'}
            className="w-full min-h-[130px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
        </section>

        <aside className="glass-card-premium rounded-3xl border border-white/10 p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-elite-accent-cyan flex items-center gap-2">
            <Sparkles size={14} />
            Event Rules
          </h2>
          <div className="space-y-3">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'global' | 'country')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="global">Global Event</option>
              <option value="country">Country Event</option>
            </select>
            {scope === 'country' ? (
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              >
                {['Nepal', 'USA', 'India', 'UK', 'Australia', 'Japan', 'China'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : null}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <input
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Event type (e.g. sports, election)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              placeholder="Priority"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description"
              className="w-full min-h-[90px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div className="text-[10px] text-slate-400 uppercase tracking-widest">
            Effective slug: {effectiveSlug || 'auto-generated'}
          </div>
        </aside>
      </div>
    </form>
  );
}

