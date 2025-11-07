'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface QuestionBankSummary {
  id: string;
  name: string;
}

interface PracticeSummary {
  id: string;
  title: string;
  updatedAt?: string;
}

interface PracticeStudioProps {
  banks: QuestionBankSummary[];
  recentPracticeSets: PracticeSummary[];
}

export function PracticeStudio({ banks, recentPracticeSets }: PracticeStudioProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    questionCount: 40,
    selectedBanks: banks.slice(0, 2).map((bank) => bank.id),
    tags: 'practice, mock',
    releaseAt: '',
    visibility: 'private' as 'private' | 'public' | 'cohort',
    cohorts: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0 && form.selectedBanks.length > 0, [form.title, form.selectedBanks.length]);

  const toggleBank = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedBanks: prev.selectedBanks.includes(id)
        ? prev.selectedBanks.filter((bankId) => bankId !== id)
        : [...prev.selectedBanks, id],
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        bankIds: form.selectedBanks,
        questionCount: Number(form.questionCount) || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        releaseAt: form.releaseAt || undefined,
        visibility: form.visibility,
        cohorts:
          form.visibility === 'cohort'
            ? form.cohorts
                .split(',')
                .map((cohort) => cohort.trim())
                .filter(Boolean)
            : [],
      };

      const res = await fetch('/api/admin/practice-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save practice set');
      setResult(data.practiceSetId);
    } catch (err: any) {
      setError(err.message || 'Unable to save practice set');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Practice Set Studio</h2>
            <p className="text-sm text-slate-500">Build adaptive practice sets from curated question banks and release on schedule.</p>
          </div>
          <Badge variant="info">Practice</Badge>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <section className="space-y-4">
            <label className="space-y-1 text-sm text-slate-600">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Loksewa Daily Practice Set"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Question count
              <input
                type="number"
                value={form.questionCount}
                onChange={(e) => setForm((prev) => ({ ...prev, questionCount: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Question banks</span>
              <div className="grid gap-2 md:grid-cols-2">
                {banks.map((bank) => {
                  const selected = form.selectedBanks.includes(bank.id);
                  return (
                    <button
                      type="button"
                      key={bank.id}
                      onClick={() => toggleBank(bank.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                        selected ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-700">{bank.name}</div>
                      <div className="text-[11px] text-slate-500">{selected ? 'Selected' : 'Tap to include'}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="space-y-1 text-sm text-slate-600">
              Tags
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="practice, mock"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Release at
              <input
                type="datetime-local"
                value={form.releaseAt}
                onChange={(e) => setForm((prev) => ({ ...prev, releaseAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Visibility
              <select
                value={form.visibility}
                onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'private' | 'public' | 'cohort' }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="cohort">Specific cohorts</option>
              </select>
            </label>
            {form.visibility === 'cohort' && (
              <label className="space-y-1 text-sm text-slate-600">
                Cohorts
                <input
                  value={form.cohorts}
                  onChange={(e) => setForm((prev) => ({ ...prev, cohorts: e.target.value }))}
                  placeholder="cohort-2025, pilot"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            )}
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
              {saving ? 'Saving…' : 'Save practice set'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-xs text-slate-600">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="mt-3 space-y-1">
                <div className="text-sm font-semibold text-slate-900">{form.title || 'Practice set title'}</div>
                <div className="text-xs text-slate-500">Questions: {form.questionCount} • Banks: {form.selectedBanks.length}</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {form.selectedBanks.map((id) => {
                    const bank = banks.find((bank) => bank.id === id);
                    return <li key={id}>{bank ? bank.name : id}</li>;
                  })}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent practice sets</h3>
              {recentPracticeSets.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No practice sets yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentPracticeSets.map((practice) => (
                    <div key={practice.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{practice.title}</div>
                        <div className="text-xs text-slate-400">{practice.updatedAt ? new Date(practice.updatedAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Practice set saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
