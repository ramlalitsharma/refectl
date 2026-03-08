'use client';

import { useState } from 'react';

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');

  const generate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(out);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm">
        Length
        <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full p-2 rounded-lg border mt-1" />
      </label>
      <button type="button" onClick={generate} className="px-6 py-3 rounded-xl bg-elite-accent-cyan text-black font-black uppercase text-xs tracking-[0.25em]">
        Generate
      </button>
      {password && (
        <div className="p-3 rounded-xl border bg-slate-50 dark:bg-elite-surface text-slate-800 dark:text-slate-200 break-all">
          {password}
        </div>
      )}
    </div>
  );
}

