'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface NavigationLink {
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

interface BrandingState {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
}

interface SeoState {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

interface FormState {
  branding: BrandingState;
  supportEmail: string;
  defaultLanguage: string;
  timezone: string;
  navigation: NavigationLink[];
  seo: SeoState;
  footerHtml: string;
  published: boolean;
}

const defaultForm: FormState = {
  branding: {
    siteName: 'AdaptIQ',
    tagline: 'AI-Powered Adaptive Learning Platform',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#0f766e',
    accentColor: '#10b981',
  },
  supportEmail: 'support@example.com',
  defaultLanguage: 'en',
  timezone: 'UTC',
  navigation: [
    { label: 'Courses', href: '/courses', target: '_self' },
    { label: 'Blog', href: '/blog', target: '_self' },
    { label: 'Pricing', href: '/pricing', target: '_self' },
  ],
  seo: {
    title: 'AdaptIQ – Adaptive Learning LMS',
    description: 'Adaptive learning platform delivering AI-powered courses, exams, and analytics.',
    keywords: 'adaptive learning, LMS, AI courses',
    image: '',
  },
  footerHtml: '<p>© AdaptIQ. All rights reserved.</p>',
  published: false,
};

export function AdminSettingsForm() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/site-settings');
        if (!res.ok) throw new Error('Failed to load site settings');
        const data = await res.json();
        if (cancelled) return;
        if (data?.settings) {
          const { settings } = data;
          setForm({
            branding: {
              siteName: settings.branding?.siteName || defaultForm.branding.siteName,
              tagline: settings.branding?.tagline || '',
              logoUrl: settings.branding?.logoUrl || '',
              faviconUrl: settings.branding?.faviconUrl || '',
              primaryColor: settings.branding?.primaryColor || defaultForm.branding.primaryColor,
              accentColor: settings.branding?.accentColor || defaultForm.branding.accentColor,
            },
            supportEmail: settings.supportEmail || defaultForm.supportEmail,
            defaultLanguage: settings.defaultLanguage || defaultForm.defaultLanguage,
            timezone: settings.timezone || defaultForm.timezone,
            navigation: Array.isArray(settings.navigation) && settings.navigation.length
              ? settings.navigation
              : defaultForm.navigation,
            seo: {
              title: settings.seo?.title || defaultForm.seo.title,
              description: settings.seo?.description || defaultForm.seo.description,
              keywords: (settings.seo?.keywords || []).join(', '),
              image: settings.seo?.image || '',
            },
            footerHtml: settings.footerHtml || defaultForm.footerHtml,
            published: Boolean(settings.publishedAt),
          });
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err.message || 'Unable to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addNavigationLink = () => {
    setForm((prev) => ({
      ...prev,
      navigation: [...prev.navigation, { label: 'New link', href: '/', target: '_self' }],
    }));
  };

  const updateNavigationLink = (index: number, key: keyof NavigationLink, value: string) => {
    setForm((prev) => ({
      ...prev,
      navigation: prev.navigation.map((link, idx) =>
        idx === index ? { ...link, [key]: value } : link,
      ),
    }));
  };

  const removeNavigationLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      navigation: prev.navigation.filter((_, idx) => idx !== index),
    }));
  };

  const navigationValidation = useMemo(() => {
    if (!form.navigation.length) return 'At least one navigation link is required';
    for (const link of form.navigation) {
      if (!link.label.trim() || !link.href.trim()) {
        return 'Navigation links must include both a label and href';
      }
    }
    return null;
  }, [form.navigation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (navigationValidation) {
      setError(navigationValidation);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        branding: form.branding,
        supportEmail: form.supportEmail,
        defaultLanguage: form.defaultLanguage,
        timezone: form.timezone,
        navigation: form.navigation,
        seo: {
          title: form.seo.title,
          description: form.seo.description,
          keywords: form.seo.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          image: form.seo.image,
        },
      footerHtml: form.footerHtml,
        published: form.published,
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }
      setFeedback('Settings saved successfully');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Loading settings…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Branding</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">Site name
            <input
              value={form.branding.siteName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, siteName: e.target.value } }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </label>
          <label className="block text-sm">Tagline
            <input
              value={form.branding.tagline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, tagline: e.target.value } }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </label>
          <label className="block text-sm">Primary color
            <input
              type="color"
              value={form.branding.primaryColor}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))
              }
              className="mt-1 h-12 w-full rounded-lg border border-slate-200"
            />
          </label>
          <label className="block text-sm">Accent color
            <input
              type="color"
              value={form.branding.accentColor}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, accentColor: e.target.value } }))
              }
              className="mt-1 h-12 w-full rounded-lg border border-slate-200"
            />
          </label>
          <label className="block text-sm md:col-span-2">Logo URL
            <input
              value={form.branding.logoUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, logoUrl: e.target.value } }))
              }
              placeholder="https://cdn.example.com/logo.svg"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">Favicon URL
            <input
              value={form.branding.faviconUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, branding: { ...prev.branding, faviconUrl: e.target.value } }))
              }
              placeholder="https://cdn.example.com/favicon.ico"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact & Localization</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">Support email
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, supportEmail: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">Default language
            <select
              value={form.defaultLanguage}
              onChange={(e) => setForm((prev) => ({ ...prev, defaultLanguage: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
          <label className="block text-sm">Timezone
            <input
              value={form.timezone}
              onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
              placeholder="e.g. Asia/Kathmandu"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
          <Button type="button" variant="outline" size="sm" onClick={addNavigationLink}>
            + Add link
          </Button>
        </div>
        <div className="space-y-3">
          {form.navigation.map((link, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.2fr),minmax(0,0.6fr)]">
                <label className="block text-sm">Label
                  <input
                    value={link.label}
                    onChange={(e) => updateNavigationLink(index, 'label', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="block text-sm">Href
                  <input
                    value={link.href}
                    onChange={(e) => updateNavigationLink(index, 'href', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="block text-sm">Target
                  <select
                    value={link.target || '_self'}
                    onChange={(e) => updateNavigationLink(index, 'target', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="_self">Same tab</option>
                    <option value="_blank">New tab</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 text-right">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeNavigationLink(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Defaults</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">Default title
            <input
              value={form.seo.title}
              onChange={(e) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">Meta description
            <textarea
              value={form.seo.description}
              onChange={(e) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">Keywords (comma separated)
            <input
              value={form.seo.keywords}
              onChange={(e) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, keywords: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">Social preview image URL
            <input
              value={form.seo.image}
              onChange={(e) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, image: e.target.value } }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Footer HTML</h2>
        <textarea
          value={form.footerHtml}
          onChange={(e) => setForm((prev) => ({ ...prev, footerHtml: e.target.value }))}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
        />
      </section>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
        />
        Publish settings immediately
      </label>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {feedback && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div>}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}

