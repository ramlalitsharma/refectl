'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface QuestionBank {
  id: string;
  name: string;
  subject?: string;
  examType?: string;
  tags?: string[];
}

interface QuestionStudioProps {
  banks: QuestionBank[];
}

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

type Difficulty = 'easy' | 'medium' | 'hard';

interface OptionField {
  id: string;
  text: string;
  correct: boolean;
}

export function QuestionStudio({ banks }: QuestionStudioProps) {
  const [selectedBank, setSelectedBank] = useState<string>(banks[0]?.id || '');
  const [creatingBank, setCreatingBank] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', subject: '', examType: '', tags: '' });

  const [form, setForm] = useState({
    question: '',
    type: 'multiple-choice' as QuestionType,
    difficulty: 'medium' as Difficulty,
    topic: '',
    examType: '',
    explanation: '',
    tags: 'adaptive,quiz',
  });

  const [options, setOptions] = useState<OptionField[]>([
    { id: 'A', text: '', correct: true },
    { id: 'B', text: '', correct: false },
    { id: 'C', text: '', correct: false },
    { id: 'D', text: '', correct: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!selectedBank && banks[0]) {
      setSelectedBank(banks[0].id);
    }
  }, [banks, selectedBank]);

  const canSubmit = useMemo(() => {
    if (!selectedBank && !creatingBank) return false;
    if (!form.question.trim()) return false;
    if (form.type === 'multiple-choice') {
      return options.every((opt) => opt.text.trim()) && options.some((opt) => opt.correct);
    }
    return true;
  }, [selectedBank, creatingBank, form, options]);

  const updateOption = (index: number, key: keyof OptionField, value: string | boolean) => {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, [key]: value } : option)),
    );
  };

  const addOption = () => {
    const nextChar = String.fromCharCode(65 + options.length);
    setOptions((prev) => [...prev, { id: nextChar, text: '', correct: false }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: banks.find((bank) => bank.id === selectedBank)?.subject || undefined,
          topic: form.topic.trim() || undefined,
          difficulty: form.difficulty,
          questionType: form.type,
          examType: form.examType.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate question');
      const first = data.questions?.[0];
      if (first) {
        setForm((prev) => ({
          ...prev,
          question: first.question,
          explanation: first.answerExplanation || '',
        }));
        if (first.options) {
          setOptions(
            first.options.map((opt: any, index: number) => ({
              id: opt.id || String.fromCharCode(65 + index),
              text: opt.text,
              correct: Boolean(opt.correct),
            })),
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to generate question');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateBank = async () => {
    if (!newBank.name.trim()) {
      setError('Please provide a bank name');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/question-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBank.name.trim(),
          description: newBank.subject ? `Subject: ${newBank.subject}` : undefined,
          subject: newBank.subject.trim() || undefined,
          examType: newBank.examType.trim() || undefined,
          tags: newBank.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create question bank');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Unable to create bank');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      let bankId = selectedBank;
      if (creatingBank) {
        const res = await fetch('/api/admin/question-banks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newBank.name.trim(),
            description: newBank.subject ? `Subject: ${newBank.subject}` : undefined,
            subject: newBank.subject.trim() || undefined,
            examType: newBank.examType.trim() || undefined,
            tags: newBank.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create bank');
        bankId = data.bank?.id || data.bank?._id;
      }

      const payload: any = {
        question: form.question,
        type: form.type,
        difficulty: form.difficulty,
        answerExplanation: form.explanation,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (form.topic) payload.tags.push(form.topic.trim());
      if (form.examType) payload.tags.push(`exam:${form.examType.trim()}`);

      if (form.type === 'multiple-choice') {
        payload.options = options.map((option) => ({
          id: option.id,
          text: option.text,
          correct: option.correct,
        }));
      }

      const res = await fetch(`/api/admin/question-banks/${bankId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save question');
      setResult({ bankId, question: payload });
      setForm((prev) => ({ ...prev, question: '', explanation: '' }));
      setOptions((prev) =>
        prev.map((option, index) => ({ ...option, text: '', correct: index === 0 })),
      );
    } catch (err: any) {
      setError(err.message || 'Unable to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Question & Quiz Studio</h2>
            <p className="text-sm text-slate-500">Curate MCQs, true/false, and short-answer items with AI assistance and tagging.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={!creatingBank ? 'inverse' : 'outline'} size="sm" onClick={() => setCreatingBank(false)}>
              Existing bank
            </Button>
            <Button variant={creatingBank ? 'inverse' : 'outline'} size="sm" onClick={() => setCreatingBank(true)}>
              New bank
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Question bank</h3>
            {!creatingBank ? (
              <label className="space-y-1 text-sm text-slate-600">
                Select bank
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} {bank.subject ? `• ${bank.subject}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="space-y-3">
                <label className="space-y-1 text-sm text-slate-600">
                  Bank name
                  <input
                    value={newBank.name}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Loksewa General Knowledge"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Subject / Stream
                  <input
                    value={newBank.subject}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="General Studies"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Exam type
                  <input
                    value={newBank.examType}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, examType: e.target.value }))}
                    placeholder="Loksewa"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Tags
                  <input
                    value={newBank.tags}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="aptitude, reasoning"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <Button variant="outline" size="sm" onClick={handleCreateBank} disabled={loading}>
                  {loading ? 'Creating…' : 'Create bank'}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <label className="space-y-1 text-sm text-slate-600">
                Topic / competency
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  placeholder="Photosynthesis, Algebra, Constitution"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Exam type
                <input
                  value={form.examType}
                  onChange={(e) => setForm((prev) => ({ ...prev, examType: e.target.value }))}
                  placeholder="Loksewa, IELTS, SAT"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Tags
                <input
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="adaptive, quiz"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Difficulty
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Question type
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as QuestionType }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="multiple-choice">Multiple choice</option>
                  <option value="true-false">True / False</option>
                  <option value="short-answer">Short answer</option>
                </select>
              </label>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : 'Generate with AI'}
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Compose question</h3>
            <label className="space-y-1 text-sm text-slate-600">
              Question prompt
              <textarea
                value={form.question}
                onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            {form.type === 'multiple-choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Options</h4>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    + Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-600">Option {option.id}</span>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={option.correct}
                            onChange={(e) => updateOption(index, 'correct', e.target.checked)}
                          />
                          Correct
                        </label>
                      </div>
                      <textarea
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        rows={2}
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                      {options.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="space-y-1 text-sm text-slate-600">
              Answer explanation / rationale
              <textarea
                value={form.explanation}
                onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? 'Saving…' : 'Save question'}
            </Button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
              <div className="mt-3 space-y-2">
                <Badge variant="info">{form.difficulty}</Badge>
                <h4 className="text-base font-semibold text-slate-900">{form.question || 'Question prompt'}</h4>
                {form.topic && <p className="text-xs text-slate-500">Topic: {form.topic}</p>}
                {form.examType && <p className="text-xs text-slate-500">Exam: {form.examType}</p>}
                {form.type === 'multiple-choice' ? (
                  <ol className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {options.map((option) => (
                      <li key={option.id} className={option.correct ? 'font-semibold text-emerald-700' : ''}>
                        {option.id}. {option.text || 'Option text'}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-600">Provide response: __________</p>
                )}
                {form.explanation && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
                    Explanation: {form.explanation}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question banks</h3>
              {banks.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No question banks yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {banks.map((bank) => (
                    <div key={bank.id} className={`rounded-lg border px-3 py-2 text-xs ${bank.id === selectedBank ? 'border-slate-400 bg-slate-100' : 'border-slate-200'}`}>
                      <div className="font-medium text-slate-700">{bank.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {bank.subject ? `${bank.subject} • ` : ''}{bank.examType || 'General'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-xs text-emerald-800">
                Saved to bank {result.bankId}.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
