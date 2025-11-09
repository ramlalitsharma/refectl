'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

interface BlogSummary {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
}

interface BlogCreatorStudioProps {
  recentBlogs: BlogSummary[];
}

interface BlogResource {
  type: 'link' | 'image' | 'pdf' | 'video';
  label: string;
  url: string;
}

export function BlogCreatorStudio({ recentBlogs }: BlogCreatorStudioProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    audience: '',
    tone: 'In-depth yet accessible',
    callToAction: 'Invite readers to enroll in AdaptIQ',
    keywords: 'adaptive learning, ai quizzes',
    tags: 'education, adaptive learning',
    heroImage: '',
    seoTitle: '',
    seoDescription: '',
    markdown: '# Outline\n- Intro\n- Key insight\n- CTA',
  });
  const [resources, setResources] = useState<BlogResource[]>([]);

  const canSubmit = useMemo(() => {
    if (mode === 'manual') {
      return Boolean(form.title.trim() && form.markdown.trim());
    }
    return Boolean((form.topic || form.title).trim());
  }, [form, mode]);

  const handleGeneratePreview = async () => {
    const topic = form.topic.trim() || form.title.trim();
    if (!topic) {
      setError('Provide a topic or title before generating.');
      return;
    }
    setError(null);
    setGeneratingPreview(true);
    try {
      const payload = {
        topic,
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        callToAction: form.callToAction.trim() || undefined,
        keywords: form.keywords
          .split(',')
          .map((kw) => kw.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate blog preview');
      }
      setForm((prev) => ({ ...prev, markdown: data.markdown }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to generate preview');
    } finally {
      setGeneratingPreview(false);
    }
  };

  const updateResource = (index: number, key: keyof BlogResource, value: string) => {
    setResources((prev) => prev.map((resource, i) => (i === index ? { ...resource, [key]: value } : resource)));
  };

  const addResource = () => setResources((prev) => [...prev, { type: 'link', label: '', url: '' }]);
  const removeResource = (index: number) => setResources((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        mode,
        title: form.title.trim() || undefined,
        topic: form.topic.trim() || undefined,
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        callToAction: form.callToAction.trim() || undefined,
        keywords: form.keywords
          .split(',')
          .map((kw) => kw.trim())
          .filter(Boolean),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        heroImage: form.heroImage.trim() || undefined,
        seo: {
          title: form.seoTitle.trim() || undefined,
          description: form.seoDescription.trim() || undefined,
        },
        resources: resources.filter((resource) => resource.label.trim() && resource.url.trim()),
      };
      if (mode === 'manual') {
        payload.markdown = form.markdown;
      }

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create blog');
      }
      setResult(data.blog);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const seoTitle = form.seoTitle || `${form.title || form.topic || 'Blog'} | AdaptIQ Blog`;
  const seoDescription = form.seoDescription || form.callToAction || 'AI-enhanced blog';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Blog Studio</h2>
            <p className="text-sm text-slate-500">Generate editorial pieces with AI, optimize for SEO, and ship marketing CTAs.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
              AI Article
            </Button>
            <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
              Manual Markdown
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Editorial metadata</h3>
            <div className="space-y-3">
              <label className="space-y-1 text-sm text-slate-600">
                Blog title
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Why Adaptive Learning Outperforms Static Curricula"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                AI topic focus
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  placeholder="Adaptive assessments for competitive exams"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Target audience
                <input
                  value={form.audience}
                  onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                  placeholder="Heads of L&D, high school students, etc."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tone
                <input
                  value={form.tone}
                  onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                  placeholder="Thought leadership, conversational, data-driven"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Call to action
                <input
                  value={form.callToAction}
                  onChange={(e) => setForm((prev) => ({ ...prev, callToAction: e.target.value }))}
                  placeholder="Invite readers to book a demo"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Keywords
                <input
                  value={form.keywords}
                  onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                  placeholder="adaptive learning, ai quiz, netlify"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tags
                <input
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="education, adaptive learning"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Hero image URL
                <input
                  value={form.heroImage}
                  onChange={(e) => setForm((prev) => ({ ...prev, heroImage: e.target.value }))}
                  placeholder="https://images..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Supporting resources</span>
                  <Button variant="outline" size="sm" onClick={addResource}>
                    + Resource
                  </Button>
                </div>
                {resources.length === 0 && <p className="text-xs text-slate-400">Attach supplemental links, assets, or PDFs.</p>}
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
                          <option value="image">Image</option>
                          <option value="pdf">PDF</option>
                          <option value="video">Video</option>
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
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">SEO metadata</h4>
                <label className="space-y-1 text-xs text-slate-600">
                  SEO title
                  <input
                    value={form.seoTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Adaptive learning reinvented"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-600">
                  SEO description
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Discover how AI-powered adaptivity transforms exam preparation."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              {mode === 'ai' && (
                <Button variant="outline" size="sm" onClick={handleGeneratePreview} disabled={generatingPreview}>
                  {generatingPreview ? 'Generating preview…' : 'Generate AI preview'}
                </Button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Content editor</h3>
            <MarkdownEditor
              value={form.markdown}
              onChange={(next) => setForm((prev) => ({ ...prev, markdown: next }))}
              height={400}
              placeholder="# Outline\n- Intro\n- Key insight\n- CTA"
            />
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button variant="outline" disabled={!canSubmit || loading} onClick={() => handleSubmit()}>
                Publish Draft
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Live preview</h3>
              <div className="mt-3 space-y-2">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{form.title || form.topic || 'Blog title'}</h4>
                  <p className="text-xs text-slate-500">{form.audience || 'Audience TBD'} • {form.tone}</p>
                </div>
                {form.heroImage && (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <img src={form.heroImage} alt="Hero" className="h-32 w-full object-cover" />
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  {form.markdown.slice(0, 220) || 'Markdown preview will appear here once provided.'}
                  {form.markdown.length > 220 && '…'}
                </p>
                {resources.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</span>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {resources.map((resource, index) => (
                        <li key={index}>{resource.label || resource.url} ({resource.type})</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">SEO Preview</div>
                  <div className="text-slate-900">{seoTitle}</div>
                  <div>{seoDescription}</div>
                  <div className="text-slate-400">https://adaptiq.com/blog/{(form.title || form.topic || 'new-post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent blogs</h3>
              {recentBlogs.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No blog posts yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{blog.title}</div>
                        <div className="text-xs text-slate-400">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}</div>
                      </div>
                      <Badge variant={blog.status === 'published' ? 'success' : blog.status === 'in_review' ? 'info' : 'default'}>
                        {blog.status || 'draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900">Blog drafted</h3>
          <p className="text-sm text-sky-700">{result.title} — status {result.status}</p>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-white/80 p-4 text-xs text-slate-700">
{result.markdown}
          </pre>
        </div>
      )}
    </div>
  );
}
