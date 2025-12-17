'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TutorialSummary {
  id: string;
  title: string;
  format?: string;
  updatedAt?: string;
}

interface TutorialStudioProps {
  recentTutorials: TutorialSummary[];
}

interface TutorialSection {
  title: string;
  duration: number;
  narrative: string;
  demo: string;
}

interface TutorialResource {
  type: 'link' | 'video' | 'pdf' | 'slides';
  label: string;
  url: string;
}

export function TutorialStudio({ recentTutorials }: TutorialStudioProps) {
  const [form, setForm] = useState({
    title: '',
    format: 'video' as 'video' | 'live' | 'text',
    audience: '',
    durationMinutes: 45,
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    objectives: 'Build an adaptive quiz end to end',
    tags: 'quiz, adaptive',
    releaseAt: '',
  });

  const [sections, setSections] = useState<TutorialSection[]>([
    {
      title: 'Introduction',
      duration: 5,
      narrative: 'Introduce topic and learning objectives.',
      demo: 'Show final output.',
    },
  ]);

  const [resources, setResources] = useState<TutorialResource[]>([]);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0 && sections.every((section) => section.title.trim()), [form.title, sections]);

  const updateSection = (index: number, key: keyof TutorialSection, value: string | number) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, [key]: value } : section)));
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}`,
        duration: 10,
        narrative: 'Explain concept.',
        demo: 'Hands-on demonstration.',
      },
    ]);
  };

  const removeSection = (index: number) => setSections((prev) => prev.filter((_, i) => i !== index));

  const addResource = () => setResources((prev) => [...prev, { type: 'link', label: '', url: '' }]);
  const updateResource = (index: number, key: keyof TutorialResource, value: string) => {
    setResources((prev) => prev.map((resource, i) => (i === index ? { ...resource, [key]: value } : resource)));
  };
  const removeResource = (index: number) => setResources((prev) => prev.filter((_, i) => i !== index));

  const handleGenerateOutline = async () => {
    setOutlineLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tutorials/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          format: form.format,
          audience: form.audience,
          durationMinutes: form.durationMinutes,
          level: form.level,
          objectives: form.objectives,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outline');
      const rawSections = (data.outline.sections || []) as Array<{ title?: string; duration?: number; narrative?: string; demo?: string }>;
      const generatedSections = rawSections.map((section) => ({
        title: section.title,
        duration: section.duration || 10,
        narrative: section.narrative || '',
        demo: section.demo || '',
      }));
      if (generatedSections.length) {
        setSections(generatedSections);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unable to generate outline');
    } finally {
      setOutlineLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        format: form.format,
        audience: form.audience.trim() || undefined,
        durationMinutes: Number(form.durationMinutes) || undefined,
        level: form.level,
        objectives: form.objectives.trim() || undefined,
        sections,
        resources: resources.filter((resource) => resource.label.trim() && resource.url.trim()),
        releaseAt: form.releaseAt || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/tutorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save tutorial');
      setResult(data.tutorialId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unable to save tutorial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tutorial & Lecture Studio</h2>
            <p className="text-sm text-slate-500">Craft lecture scripts, demo walkthroughs, and downloadable resources.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerateOutline} disabled={outlineLoading || !form.title}>
            {outlineLoading ? 'Generating…' : 'AI Outline'}
          </Button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,1.3fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <label className="space-y-1 text-sm text-slate-600">
              Tutorial title
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Adaptive Quiz Builder Walkthrough"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Format
                <select
                  value={form.format}
                  onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value as 'video' | 'live' | 'text' }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="video">Video</option>
                  <option value="live">Live session</option>
                  <option value="text">Text-only</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Duration (minutes)
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Level
                <select
                  value={form.level}
                  onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Audience
                <input
                  value={form.audience}
                  onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                  placeholder="Junior developers, science majors"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-slate-600">
              Learning objectives
              <textarea
                value={form.objectives}
                onChange={(e) => setForm((prev) => ({ ...prev, objectives: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tags
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="quiz, demo"
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
              <h3 className="text-sm font-semibold text-slate-800">Sections</h3>
              <Button variant="outline" size="sm" onClick={addSection}>
                + Section
              </Button>
            </div>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex-1 text-sm text-slate-600">
                      Title
                      <input
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    {sections.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeSection(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <label className="mt-3 block text-sm text-slate-600">
                    Duration (minutes)
                    <input
                      type="number"
                      value={section.duration}
                      onChange={(e) => updateSection(index, 'duration', Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-slate-600">
                    Narrative / talking points
                    <textarea
                      value={section.narrative}
                      onChange={(e) => updateSection(index, 'narrative', e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-slate-600">
                    Demo / activity
                    <textarea
                      value={section.demo}
                      onChange={(e) => updateSection(index, 'demo', e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</h4>
                <Button variant="outline" size="sm" onClick={addResource}>
                  + Resource
                </Button>
              </div>
              {resources.length === 0 && <p className="text-xs text-slate-400">Attach slides, references, or supportive links.</p>}
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={resource.type}
                        onChange={(e) => updateResource(index, 'type', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="link">Link</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="slides">Slides</option>
                      </select>
                      <input
                        value={resource.label}
                        onChange={(e) => updateResource(index, 'label', e.target.value)}
                        placeholder="Resource title"
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={resource.url}
                        onChange={(e) => updateResource(index, 'url', e.target.value)}
                        placeholder="https://"
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeResource(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
              {saving ? 'Saving…' : 'Save tutorial'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm text-slate-700">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{form.title || 'Tutorial title'}</span>
                  <span className="text-xs text-slate-500">{form.format} • {form.level}</span>
                </div>
                <div className="text-xs text-slate-500">Audience: {form.audience || 'N/A'} • Duration: {form.durationMinutes} mins</div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Sections ({sections.length})</span>
                  <ul className="mt-2 space-y-1">
                    {sections.map((section, index) => (
                      <li key={index}>
                        {section.title} • {section.duration} mins
                      </li>
                    ))}
                  </ul>
                </div>
                {form.objectives && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Objectives</span>
                    <p className="mt-1 whitespace-pre-line">{form.objectives}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent tutorials</h3>
              {recentTutorials.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No tutorials yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentTutorials.map((tutorial) => (
                    <div key={tutorial.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{tutorial.title}</div>
                        <div className="text-xs text-slate-400">{tutorial.updatedAt ? new Date(tutorial.updatedAt).toLocaleString() : ''}</div>
                      </div>
                      <span className="text-xs text-slate-500">{tutorial.format || 'video'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Tutorial saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
