'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface EbookSummary {
  id: string;
  title: string;
  updatedAt?: string;
}

interface EbookStudioProps {
  recentEbooks: EbookSummary[];
}

interface ChapterOutline {
  title: string;
  summary: string;
  keyTakeaways: string;
  resources: string;
}

export function EbookStudio({ recentEbooks }: EbookStudioProps) {
  const [form, setForm] = useState({
    title: '',
    audience: '',
    tone: 'Practical and inspiring',
    focus: 'Adaptive learning strategies',
    chapters: 6,
    tags: 'ebook, adaptive',
    releaseAt: '',
  });
  const [chapters, setChapters] = useState<ChapterOutline[]>([
    { title: 'Chapter 1', summary: 'Outline the challenge and opportunity.', keyTakeaways: '• Adaptive learning overview', resources: '' },
  ]);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0 && chapters.every((chapter) => chapter.title.trim()), [form.title, chapters]);

  const updateChapter = (index: number, key: keyof ChapterOutline, value: string) => {
    setChapters((prev) => prev.map((chapter, i) => (i === index ? { ...chapter, [key]: value } : chapter)));
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `Chapter ${prev.length + 1}`,
        summary: 'Describe major insight.',
        keyTakeaways: '• Key idea 1\n• Key idea 2',
        resources: '',
      },
    ]);
  };

  const removeChapter = (index: number) => setChapters((prev) => prev.filter((_, i) => i !== index));

  const handleGenerateOutline = async () => {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ebooks/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          audience: form.audience,
          tone: form.tone,
          chapters: form.chapters,
          focus: form.focus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outline');
      const generated = (data.outline.chapters || []).map((chapter: any) => ({
        title: chapter.title,
        summary: chapter.summary,
        keyTakeaways: (chapter.keyTakeaways || []).map((item: string) => `• ${item}`).join('\n'),
        resources: (chapter.resources || []).join('\n'),
      }));
      if (generated.length) setChapters(generated);
    } catch (err: any) {
      setError(err.message || 'Unable to generate outline');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        focus: form.focus.trim() || undefined,
        chapters: form.chapters ? Number(form.chapters) : undefined,
        outline: {
          chapters: chapters.map((chapter) => ({
            title: chapter.title,
            summary: chapter.summary,
            keyTakeaways: chapter.keyTakeaways
              .split('\n')
              .map((line) => line.replace(/^•\s?/, '').trim())
              .filter(Boolean),
            resources: chapter.resources
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          })),
        },
        releaseAt: form.releaseAt || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/ebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save ebook');
      setResult(data.ebookId);
    } catch (err: any) {
      setError(err.message || 'Unable to save ebook');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Ebook & Notes Studio</h2>
            <p className="text-sm text-slate-500">Generate chapter-wise ebooks, study guides, and downloadable notes.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerateOutline} disabled={previewing || !form.title}>
            {previewing ? 'Generating…' : 'AI Outline'}
          </Button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr),minmax(0,1.2fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <label className="space-y-1 text-sm text-slate-600">
              Ebook title
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Adaptive Learning Playbook"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Target audience
              <input
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                placeholder="Teachers, exam aspirants"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tone & style
              <input
                value={form.tone}
                onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                placeholder="Practical and inspiring"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Core focus
              <input
                value={form.focus}
                onChange={(e) => setForm((prev) => ({ ...prev, focus: e.target.value }))}
                placeholder="Adaptive assessments for competitive exams"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Number of chapters (suggested)
              <input
                type="number"
                value={form.chapters}
                onChange={(e) => setForm((prev) => ({ ...prev, chapters: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tags
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="ebook, adaptive"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Release at (optional)
              <input
                type="datetime-local"
                value={form.releaseAt}
                onChange={(e) => setForm((prev) => ({ ...prev, releaseAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Chapters</h3>
              <Button variant="outline" size="sm" onClick={addChapter}>
                + Chapter
              </Button>
            </div>
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex-1 text-sm text-slate-600">
                      Chapter title
                      <input
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    {chapters.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeChapter(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <label className="mt-3 block text-sm text-slate-600">
                    Summary
                    <textarea
                      value={chapter.summary}
                      onChange={(e) => updateChapter(index, 'summary', e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-slate-600">
                    Key takeaways (one per line)
                    <textarea
                      value={chapter.keyTakeaways}
                      onChange={(e) => updateChapter(index, 'keyTakeaways', e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-slate-600">
                    Resources / references
                    <textarea
                      value={chapter.resources}
                      onChange={(e) => updateChapter(index, 'resources', e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                </div>
              ))}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
              {saving ? 'Saving…' : 'Save ebook'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm text-slate-700">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="mt-3 space-y-2">
                <div className="font-semibold text-slate-900">{form.title || 'Ebook title'}</div>
                <div className="text-xs text-slate-500">Audience: {form.audience || 'N/A'} • Chapters: {chapters.length}</div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Outline</span>
                  <ol className="mt-2 space-y-1 list-decimal pl-4">
                    {chapters.map((chapter, index) => (
                      <li key={index}>
                        {chapter.title} – {chapter.summary.slice(0, 80) || 'Summary pending'}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent ebooks</h3>
              {recentEbooks.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No ebooks yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentEbooks.map((ebook) => (
                    <div key={ebook.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{ebook.title}</div>
                        <div className="text-xs text-slate-400">{ebook.updatedAt ? new Date(ebook.updatedAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Ebook saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
