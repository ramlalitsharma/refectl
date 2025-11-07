'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface QuestionBankSummary {
  id: string;
  name: string;
  subject?: string;
  examType?: string;
}

interface ExamSummary {
  id: string;
  name: string;
  category?: string;
  updatedAt?: string;
}

interface ExamStudioProps {
  questionBanks: QuestionBankSummary[];
  recentExams: ExamSummary[];
}

type DifficultyMix = {
  easy?: number;
  medium?: number;
  hard?: number;
};

type Section = {
  title: string;
  bankId: string;
  count: number;
  marksPerQuestion: number;
  difficultyMix: DifficultyMix;
};

export function ExamStudio({ questionBanks, recentExams }: ExamStudioProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Mock Test',
    examType: '',
    durationMinutes: 90,
    totalMarks: 100,
    passingScore: 60,
    tags: 'adaptive, mock-test',
    releaseAt: '',
    closeAt: '',
    visibility: 'private' as 'private' | 'public' | 'cohort',
    cohorts: '',
    priceAmount: '',
    priceCurrency: 'USD',
  });

  const [sections, setSections] = useState<Section[]>([
    {
      title: 'Section A',
      bankId: questionBanks[0]?.id || '',
      count: 10,
      marksPerQuestion: 2,
      difficultyMix: { easy: 4, medium: 4, hard: 2 },
    },
  ]);

  const [questionsManual, setQuestionsManual] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const totalPlannedQuestions = useMemo(() => sections.reduce((sum, section) => sum + Number(section.count || 0), 0), [sections]);

  const canSubmit = useMemo(() => form.name.trim().length > 0 && totalPlannedQuestions > 0, [form.name, totalPlannedQuestions]);

  const updateSection = (index: number, key: keyof Section, value: any) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, [key]: value } : section)));
  };

  const updateDifficulty = (index: number, level: keyof DifficultyMix, value: number) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, difficultyMix: { ...section.difficultyMix, [level]: value } } : section,
      ),
    );
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: `Section ${String.fromCharCode(65 + prev.length)}`,
        bankId: questionBanks[0]?.id || '',
        count: 10,
        marksPerQuestion: 2,
        difficultyMix: { easy: 5, medium: 3, hard: 2 },
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        questionBankIds: sections.map((section) => section.bankId).filter(Boolean),
        questionIds: questionsManual
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
        durationMinutes: Number(form.durationMinutes) || 90,
        totalMarks: Number(form.totalMarks) || 0,
        passingScore: form.passingScore ? Number(form.passingScore) : undefined,
        category: form.category,
        examType: form.examType.trim() || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        sections: sections.map((section) => ({
          title: section.title,
          bankId: section.bankId,
          count: Number(section.count) || 0,
          marksPerQuestion: Number(section.marksPerQuestion) || 0,
          difficultyMix: section.difficultyMix,
        })),
        releaseAt: form.releaseAt || undefined,
        closeAt: form.closeAt || undefined,
        visibility: form.visibility,
        cohorts:
          form.visibility === 'cohort'
            ? form.cohorts
                .split(',')
                .map((cohort) => cohort.trim())
                .filter(Boolean)
            : [],
        price:
          form.priceAmount
            ? {
                currency: form.priceCurrency || 'USD',
                amount: Number(form.priceAmount),
              }
            : undefined,
      };

      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create exam');
      }
      setResult(data.exam);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Exam & Prep Studio</h2>
            <p className="text-sm text-slate-500">Blueprint comprehensive exams, set availability, and map sections to question banks.</p>
          </div>
          <Badge variant="info">Blueprint mode</Badge>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,1.3fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Exam metadata</h3>
            <label className="space-y-1 text-sm text-slate-600">
              Exam name
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Loksewa Comprehensive Mock Test"
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
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="Mock Test">Mock Test</option>
                  <option value="Practice Set">Practice Set</option>
                  <option value="International Exam Prep">International Exam Prep</option>
                  <option value="Loksewa">Loksewa</option>
                  <option value="Curriculum Test">Curriculum Test</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Exam type
                <input
                  value={form.examType}
                  onChange={(e) => setForm((prev) => ({ ...prev, examType: e.target.value }))}
                  placeholder="Loksewa, IELTS, SEE, CBSE"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Duration (minutes)
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Total marks
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, totalMarks: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-slate-600">
              Passing score (%)
              <input
                type="number"
                value={form.passingScore}
                onChange={(e) => setForm((prev) => ({ ...prev, passingScore: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tags
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="adaptive, full-syllabus"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-xs text-slate-600">
                  Release at
                  <input
                    type="datetime-local"
                    value={form.releaseAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, releaseAt: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-600">
                  Close at
                  <input
                    type="datetime-local"
                    value={form.closeAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, closeAt: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                  />
                </label>
              </div>
              <label className="space-y-1 text-xs text-slate-600">
                Visibility
                <select
                  value={form.visibility}
                  onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'private' | 'public' | 'cohort' }))}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="cohort">Specific cohorts</option>
                </select>
              </label>
              {form.visibility === 'cohort' && (
                <label className="space-y-1 text-xs text-slate-600">
                  Cohorts (comma separated)
                  <input
                    value={form.cohorts}
                    onChange={(e) => setForm((prev) => ({ ...prev, cohorts: e.target.value }))}
                    placeholder="cohort-2025, pilot-group"
                    className="w-full rounded-lg border border-slate-200 px-2 py-1"
                  />
                </label>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Price amount (optional)
                <input
                  type="number"
                  value={form.priceAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, priceAmount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Currency
                <input
                  value={form.priceCurrency}
                  onChange={(e) => setForm((prev) => ({ ...prev, priceCurrency: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Sections blueprint</h3>
              <Button variant="outline" size="sm" onClick={addSection}>
                + Section
              </Button>
            </div>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex-1 text-sm text-slate-600">
                      Section title
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
                        {questionBanks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm text-slate-600">
                      Questions count
                      <input
                        type="number"
                        value={section.count}
                        onChange={(e) => updateSection(index, 'count', Number(e.target.value))}
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
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty mix</h4>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      <label className="space-y-1 text-xs text-slate-600">
                        Easy
                        <input
                          type="number"
                          value={section.difficultyMix.easy ?? 0}
                          onChange={(e) => updateDifficulty(index, 'easy', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-600">
                        Medium
                        <input
                          type="number"
                          value={section.difficultyMix.medium ?? 0}
                          onChange={(e) => updateDifficulty(index, 'medium', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-600">
                        Hard
                        <input
                          type="number"
                          value={section.difficultyMix.hard ?? 0}
                          onChange={(e) => updateDifficulty(index, 'hard', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <label className="space-y-1 text-sm text-slate-600">
              Manual question IDs (optional)
              <textarea
                value={questionsManual}
                onChange={(e) => setQuestionsManual(e.target.value)}
                placeholder="questionId1, questionId2"
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? 'Saving…' : 'Save exam template'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Blueprint preview</h3>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{form.name || 'Exam title'}</span>
                  <Badge variant="info">{form.category}</Badge>
                </div>
                <p>{form.description || 'Add a description for learners.'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Duration: {form.durationMinutes} mins</span>
                  <span>Marks: {form.totalMarks}</span>
                  <span>Passing: {form.passingScore}%</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                  <span className="font-semibold text-slate-700">Sections ({sections.length})</span>
                  <ul className="mt-2 space-y-2">
                    {sections.map((section, index) => (
                      <li key={index} className="rounded border border-slate-200 px-3 py-2">
                        <div className="font-medium text-slate-700">{section.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Bank: {questionBanks.find((bank) => bank.id === section.bankId)?.name || 'Unknown'} •
                          Questions: {section.count} • Marks/Q: {section.marksPerQuestion}
                        </div>
                        <div className="text-[11px] text-slate-400">Difficulty mix – E: {section.difficultyMix.easy ?? 0}, M: {section.difficultyMix.medium ?? 0}, H: {section.difficultyMix.hard ?? 0}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                {form.releaseAt && <div>Opens: {new Date(form.releaseAt).toLocaleString()}</div>}
                {form.closeAt && <div>Closes: {new Date(form.closeAt).toLocaleString()}</div>}
                {form.visibility === 'cohort' && <div>Cohorts: {form.cohorts || 'Specify cohort IDs'}</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent exams</h3>
              {recentExams.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No exam templates yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{exam.name}</div>
                        <div className="text-xs text-slate-400">{exam.updatedAt ? new Date(exam.updatedAt).toLocaleString() : ''}</div>
                      </div>
                      <Badge variant="default">{exam.category || 'Exam'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Exam template saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
