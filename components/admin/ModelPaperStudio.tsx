'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ModelPaperSummary {
  id: string;
  title: string;
  examType?: string;
  updatedAt?: string;
}

interface QuestionBankSummary {
  id: string;
  name: string;
}

interface ModelPaperStudioProps {
  banks: QuestionBankSummary[];
  recentModelPapers: ModelPaperSummary[];
}

interface ModelPaperSection {
  title: string;
  bankId: string;
  questionCount: number;
  marksPerQuestion: number;
}

export function ModelPaperStudio({ banks, recentModelPapers }: ModelPaperStudioProps) {
  const [form, setForm] = useState({
    title: '',
    examType: '',
    tags: 'model-paper, mock',
    releaseAt: '',
  });
  const [sections, setSections] = useState<ModelPaperSection[]>([
    {
      title: 'Section A',
      bankId: banks[0]?.id || '',
      questionCount: 25,
      marksPerQuestion: 1,
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0 && sections.every((section) => section.bankId), [form.title, sections]);

  const updateSection = (index: number, key: keyof ModelPaperSection, value: any) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, [key]: value } : section)));
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: `Section ${String.fromCharCode(65 + prev.length)}`,
        bankId: banks[0]?.id || '',
        questionCount: 25,
        marksPerQuestion: 1,
      },
    ]);
  };

  const removeSection = (index: number) => setSections((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        examType: form.examType.trim() || undefined,
        sections: sections.map((section) => ({
          title: section.title,
          bankId: section.bankId,
          questionCount: Number(section.questionCount) || 0,
          marksPerQuestion: Number(section.marksPerQuestion) || 0,
        })),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        releaseAt: form.releaseAt || undefined,
      };

      const res = await fetch('/api/admin/model-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save model paper');
      setResult(data.modelPaperId);
    } catch (err: any) {
      setError(err.message || 'Unable to save model paper');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Model Paper Studio</h2>
            <p className="text-sm text-slate-500">Assemble exam-style model papers categorized by board, competency, and difficulty.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <label className="space-y-1 text-sm text-slate-600">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Loksewa General Knowledge Model Paper"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Exam type
              <input
                value={form.examType}
                onChange={(e) => setForm((prev) => ({ ...prev, examType: e.target.value }))}
                placeholder="Loksewa"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tags
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="model-paper, loksewa"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Release date
              <input
                type="datetime-local"
                value={form.releaseAt}
                onChange={(e) => setForm((prev) => ({ ...prev, releaseAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Sections</h3>
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
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-slate-600">
                      Question bank
                      <select
                        value={section.bankId}
                        onChange={(e) => updateSection(index, 'bankId', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      >
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-slate-600">
                      Questions
                      <input
                        type="number"
                        value={section.questionCount}
                        onChange={(e) => updateSection(index, 'questionCount', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-slate-600">
                      Marks per question
                      <input
                        type="number"
                        value={section.marksPerQuestion}
                        onChange={(e) => updateSection(index, 'marksPerQuestion', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
              {saving ? 'Saving…' : 'Save model paper'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-xs text-slate-600">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="mt-3 space-y-2">
                <div className="font-semibold text-slate-900">{form.title || 'Model paper title'}</div>
                <div className="text-xs text-slate-500">Exam: {form.examType || 'N/A'} • Sections: {sections.length}</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {sections.map((section, index) => (
                    <li key={index}>{section.title} – {section.questionCount} questions</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent model papers</h3>
              {recentModelPapers.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No model papers yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentModelPapers.map((paper) => (
                    <div key={paper.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{paper.title}</div>
                        <div className="text-xs text-slate-400">{paper.updatedAt ? new Date(paper.updatedAt).toLocaleString() : ''}</div>
                      </div>
                      <span className="text-xs text-slate-500">{paper.examType || 'General'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Model paper saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
