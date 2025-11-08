'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface TemplateSummary {
  id: string;
  name: string;
  channel: 'in-app' | 'email' | 'sms';
  category?: string;
  updatedAt?: string;
}

interface TriggerSummary {
  id: string;
  name: string;
  eventKey: string;
  enabled: boolean;
  updatedAt?: string;
}

interface NotificationStudioProps {
  templates: TemplateSummary[];
  triggers: TriggerSummary[];
}

type Channel = 'in-app' | 'email' | 'sms';

export function NotificationStudio({ templates, triggers }: NotificationStudioProps) {
  const [tab, setTab] = useState<'templates' | 'triggers'>('templates');
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: '',
    channel: 'in-app' as Channel,
    subject: '',
    body: 'Hello {{firstName}},\nYour adaptive quiz is ready.',
    ctaLabel: '',
    ctaUrl: '',
    variables: 'firstName, courseName',
  });
  const [triggerForm, setTriggerForm] = useState({
    name: '',
    eventKey: 'user.enrolled',
    templateId: templates[0]?.id || '',
    channels: ['in-app'] as Channel[],
    enabled: true,
    cohorts: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const canSaveTemplate = useMemo(
    () => templateForm.name.trim() && templateForm.body.trim() && templateForm.channel,
    [templateForm],
  );

  const canSaveTrigger = useMemo(
    () => triggerForm.name.trim() && triggerForm.eventKey.trim() && triggerForm.templateId,
    [triggerForm],
  );

  const toggleChannel = (channel: Channel) => {
    setTriggerForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((ch) => ch !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSaveTemplate = async () => {
    if (!canSaveTemplate) return;
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          variables: templateForm.variables
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save template');
      setResult('Template saved');
    } catch (err: any) {
      setError(err.message || 'Unable to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTrigger = async () => {
    if (!canSaveTrigger) return;
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/admin/notifications/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...triggerForm,
          segment: {
            cohorts: triggerForm.cohorts
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            tags: triggerForm.tags
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save trigger');
      setResult('Trigger saved');
    } catch (err: any) {
      setError(err.message || 'Unable to save trigger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Notifications Studio</h2>
            <p className="text-sm text-slate-500">Manage in-app, email, and SMS templates, and orchestrate event triggers.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={tab === 'templates' ? 'inverse' : 'outline'} size="sm" onClick={() => setTab('templates')}>
              Templates
            </Button>
            <Button variant={tab === 'triggers' ? 'inverse' : 'outline'} size="sm" onClick={() => setTab('triggers')}>
              Triggers
            </Button>
          </div>
        </div>

        {tab === 'templates' ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)]">
            <section className="space-y-4">
              <label className="space-y-1 text-sm text-slate-600">
                Name
                <input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  Channel
                  <select
                    value={templateForm.channel}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, channel: e.target.value as Channel }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="in-app">In-app</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Category
                  <input
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Onboarding, Marketing, Alerts"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              {templateForm.channel === 'email' && (
                <label className="space-y-1 text-sm text-slate-600">
                  Email subject
                  <input
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              )}
              <label className="space-y-1 text-sm text-slate-600">
                Body (Markdown supported)
                <textarea
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, body: e.target.value }))}
                  rows={8}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  CTA label
                  <input
                    value={templateForm.ctaLabel}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  CTA URL
                  <input
                    value={templateForm.ctaUrl}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, ctaUrl: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              <label className="space-y-1 text-sm text-slate-600">
                Available variables (comma separated)
                <input
                  value={templateForm.variables}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, variables: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>

              {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              {result && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{result}</div>}
              <Button onClick={handleSaveTemplate} disabled={!canSaveTemplate || saving}>
                {saving ? 'Saving…' : 'Save template'}
              </Button>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm text-slate-700">
                <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
                <div className="mt-3 space-y-2">
                  <Badge variant="info">{templateForm.channel}</Badge>
                  <div className="font-semibold text-slate-900">{templateForm.subject || templateForm.name || 'Notification'}</div>
                  <div className="whitespace-pre-line text-xs text-slate-600">{templateForm.body}</div>
                  {templateForm.ctaLabel && (
                    <div className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600">
                      CTA: {templateForm.ctaLabel} → {templateForm.ctaUrl || 'URL pending'}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Existing templates</h3>
                <div className="mt-3 space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{template.name}</div>
                        <div className="text-xs text-slate-400">{template.updatedAt ? new Date(template.updatedAt).toLocaleString() : ''}</div>
                      </div>
                      <Badge variant="default">{template.channel}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
            <section className="space-y-4">
              <label className="space-y-1 text-sm text-slate-600">
                Trigger name
                <input
                  value={triggerForm.name}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Event key
                <input
                  value={triggerForm.eventKey}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, eventKey: e.target.value }))}
                  placeholder="user.enrolled, course.completed"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Template
                <select
                  value={triggerForm.templateId}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, templateId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-1 text-sm text-slate-600">
                Channels
                <div className="flex flex-wrap gap-2">
                  {(['in-app', 'email', 'sms'] as Channel[]).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        triggerForm.channels.includes(channel)
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={triggerForm.enabled}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                Enabled
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Cohorts (comma separated)
                <input
                  value={triggerForm.cohorts}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, cohorts: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tags / segments
                <input
                  value={triggerForm.tags}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              {result && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{result}</div>}
              <Button onClick={handleSaveTrigger} disabled={!canSaveTrigger || saving}>
                {saving ? 'Saving…' : 'Save trigger'}
              </Button>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Existing triggers</h3>
                {triggers.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">No triggers yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {triggers.map((trigger) => (
                      <div key={trigger.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{trigger.name}</div>
                          <div className="text-xs text-slate-400">{trigger.eventKey}</div>
                        </div>
                        <Badge variant={trigger.enabled ? 'success' : 'default'}>{trigger.enabled ? 'Enabled' : 'Disabled'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
