'use client';

import { useMemo, useState } from 'react';

export function TimestampConverterTool() {
  const [timestamp, setTimestamp] = useState<number | ''>('');
  const [dateInput, setDateInput] = useState('');

  const human = useMemo(() => {
    if (timestamp === '' || Number.isNaN(timestamp)) return '';
    const d = new Date(Number(timestamp));
    return d.toISOString();
  }, [timestamp]);

  const epoch = useMemo(() => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    return Number.isNaN(d.getTime()) ? '' : d.getTime().toString();
  }, [dateInput]);

  return (
    <div className="space-y-6">
      <label className="text-sm">
        Timestamp (ms)
        <input type="number" value={timestamp} onChange={(e) => setTimestamp(e.target.value ? Number(e.target.value) : '')} className="w-full p-2 rounded-lg border mt-1" />
      </label>
      <div className="text-sm text-slate-500">ISO: {human}</div>

      <label className="text-sm">
        Date (ISO or local)
        <input type="text" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="w-full p-2 rounded-lg border mt-1" placeholder="2026-03-04T10:00:00Z" />
      </label>
      <div className="text-sm text-slate-500">Epoch (ms): {epoch}</div>
    </div>
  );
}

