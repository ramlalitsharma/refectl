'use client';

import { useMemo, useState } from 'react';

export function TextUtilitiesTool() {
  const [input, setInput] = useState('');

  const wordCount = useMemo(() => input.trim().split(/\s+/).filter(Boolean).length, [input]);

  const toUpper = () => setInput(input.toUpperCase());
  const toLower = () => setInput(input.toLowerCase());
  const toTitle = () =>
    setInput(
      input
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  const removeDuplicates = () => {
    const lines = input.split(/\r?\n/);
    const unique = Array.from(new Set(lines.map((l) => l.trim()))).filter(Boolean);
    setInput(unique.join('\n'));
  };

  return (
    <div className="space-y-6">
      <textarea
        className="w-full min-h-[220px] p-4 rounded-xl border"
        placeholder="Paste your text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={toUpper} className="px-4 py-2 rounded-lg border">UPPERCASE</button>
        <button type="button" onClick={toLower} className="px-4 py-2 rounded-lg border">lowercase</button>
        <button type="button" onClick={toTitle} className="px-4 py-2 rounded-lg border">Title Case</button>
        <button type="button" onClick={removeDuplicates} className="px-4 py-2 rounded-lg border">Remove Duplicate Lines</button>
      </div>
      <div className="text-sm text-slate-500">Word count: {wordCount}</div>
    </div>
  );
}

