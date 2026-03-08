'use client';

import { useMemo, useState } from 'react';

export function UnitConverterTool() {
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState<'km' | 'mi' | 'c' | 'f'>('km');
  const [to, setTo] = useState<'km' | 'mi' | 'c' | 'f'>('mi');

  const result = useMemo(() => {
    if (from === 'km' && to === 'mi') return value * 0.621371;
    if (from === 'mi' && to === 'km') return value / 0.621371;
    if (from === 'c' && to === 'f') return value * 9 / 5 + 32;
    if (from === 'f' && to === 'c') return (value - 32) * 5 / 9;
    return value;
  }, [value, from, to]);

  return (
    <div className="space-y-4">
      <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full p-2 rounded-lg border" />
      <div className="grid grid-cols-2 gap-4">
        <select value={from} onChange={(e) => setFrom(e.target.value as any)} className="p-2 rounded-lg border">
          <option value="km">Kilometers</option>
          <option value="mi">Miles</option>
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value as any)} className="p-2 rounded-lg border">
          <option value="km">Kilometers</option>
          <option value="mi">Miles</option>
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
        </select>
      </div>
      <div className="text-sm text-slate-500">Result: {result.toFixed(4)}</div>
    </div>
  );
}

