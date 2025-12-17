'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

interface BlogSummary {
  id: string;
  slug?: string;
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

export function BlogCreatorStudio({ recentBlogs: initialBlogs }: BlogCreatorStudioProps) {
  const [recentBlogs, setRecentBlogs] = useState<BlogSummary[]>(initialBlogs);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

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

  const handleSubmit = async (saveAsStatus?: string) => {
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
        status: saveAsStatus
      };
      if (mode === 'manual') {
        payload.markdown = form.markdown;
      }

      const url = editingSlug ? `/api/admin/blogs/${editingSlug}` : '/api/admin/blogs';
      const method = editingSlug ? 'PUT' : 'POST';

      if (editingSlug) {
        // Adapt payload for PUT
        payload.content = payload.markdown;
        delete payload.markdown;
        delete payload.mode; // Mode irrelevant on update usually
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save blog');
      }
      setResult(editingSlug ? { ...data, title: form.title, status: saveAsStatus || 'draft' } : data.blog);

      // Update local list if editing or new
      if (editingSlug) {
        setRecentBlogs(prev => prev.map(b => b.slug === editingSlug ? { ...b, title: form.title, status: saveAsStatus || b.status } : b));
        setEditingSlug(null); // Exit edit mode
        resetForm();
      } else {
        // Add new to top (simplified)
        window.location.reload(); // Simplest way to refresh list
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
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
    setResources([]);
    setEditingSlug(null);
    setMode('ai');
  }

  const handleEdit = async (blog: BlogSummary) => {
    if (!blog.slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blog.slug}`);
      if (!res.ok) throw new Error('Failed to fetch blog details');
      const data = await res.json();

      setEditingSlug(blog.slug);
      setMode('manual');
      setForm({
        title: data.title || '',
        topic: '', // Typically lost in transformation, but title is enough
        audience: '',
        tone: '',
        callToAction: '',
        keywords: '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        heroImage: data.coverImage || '',
        seoTitle: '', // Typically not in main blob unless stored specifically
        seoDescription: data.excerpt || '',
        markdown: data.content || '',
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setRecentBlogs(prev => prev.filter(b => b.slug !== slug));
    } catch (e) {
      alert('Failed to delete blog');
    }
  };

  const handleToggleStatus = async (blog: BlogSummary) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/blogs/${blog.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setRecentBlogs(prev => prev.map(b => b.slug === blog.slug ? { ...b, status: newStatus } : b));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const seoTitle = form.seoTitle || `${form.title || form.topic || 'Blog'} | AdaptIQ Blog`;
  const seoDescription = form.seoDescription || form.callToAction || 'AI-enhanced blog';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{editingSlug ? 'Editing Blog' : 'Blog Studio'}</h2>
            <p className="text-sm text-slate-500">Generate editorial pieces with AI, optimize for SEO, and ship marketing CTAs.</p>
          </div>
          <div className="flex gap-2 text-sm">
            {editingSlug ? (
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel Edit</Button>
            ) : (
              <>
                <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
                  AI Article
                </Button>
                <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
                  Manual Markdown
                </Button>
              </>
            )}

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
              {!editingSlug && (
                <>
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
                </>
              )}

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
                <h4 className="text-sm font-semibold text-slate-700">SEO metadata</h4>
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
              {mode === 'ai' && !editingSlug && (
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
              <Button onClick={() => handleSubmit('draft')} disabled={!canSubmit || loading} variant="outline">
                {loading ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button disabled={!canSubmit || loading} onClick={() => handleSubmit('published')}>
                {editingSlug ? 'Update & Publish' : 'Publish'}
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
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">SEO Preview</div>
                  <div className="text-slate-900">{seoTitle}</div>
                  <div>{seoDescription}</div>
                  <div className="text-slate-400">https://adaptiq.com/blog/{(form.title || form.topic || 'new-post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Recent blogs</h3>
              {recentBlogs.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No blog posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className={`
                            rounded-lg border px-3 py-2 transition-colors
                            ${blog.status === 'published'
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-slate-100 hover:bg-slate-50'}
                        `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-800 line-clamp-1" title={blog.title}>{blog.title}</div>
                        <Badge variant={blog.status === 'published' ? 'success' : 'secondary'} size="sm">
                          {blog.status || 'draft'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-slate-400">
                          {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}
                        </div>
                        <div className="flex gap-2">
                          {blog.slug && (
                            <>
                              <button className="text-[10px] text-slate-500 hover:text-blue-600 underline" onClick={() => handleEdit(blog)}>
                                Edit
                              </button>
                              <button
                                className="text-[10px] text-slate-500 hover:text-purple-600 underline"
                                onClick={() => handleToggleStatus(blog)}
                              >
                                {blog.status === 'published' ? 'Draft' : 'Publish'}
                              </button>
                              <button className="text-[10px] text-slate-500 hover:text-red-600 underline" onClick={() => handleDelete(blog.slug!)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {result && !editingSlug && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900">Blog saved</h3>
          <p className="text-sm text-sky-700">{result.title} — status {result.status}</p>
        </div>
      )}
    </div>
  );
}
