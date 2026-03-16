'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, Clock, Globe, Calendar, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function TimestampConverterTool() {
  const [input, setInput] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getResults = () => {
    let ts = parseInt(input);
    if (isNaN(ts)) return null;

    // Detect if seconds or milliseconds
    let date: Date;
    if (input.length <= 10) {
      date = new Date(ts * 1000);
    } else {
      date = new Date(ts);
    }

    if (isNaN(date.getTime())) return null;

    return {
      utc: date.toUTCString(),
      local: date.toString(),
      iso: date.toISOString(),
      unixSec: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const unit = absDiff < 60000 ? 'sec' : absDiff < 3600000 ? 'min' : absDiff < 86400000 ? 'hours' : 'days';
    const val = unit === 'sec' ? Math.floor(absDiff / 1000) : unit === 'min' ? Math.floor(absDiff / 60000) : unit === 'hours' ? Math.floor(absDiff / 3600000) : Math.floor(absDiff / 86400000);
    return `${val} ${unit} ${diff > 0 ? 'from now' : 'ago'}`;
  };

  const results = getResults();

  const useCurrent = () => setInput(Math.floor(Date.now() / 1000).toString());

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 border-none bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:row items-center justify-between gap-8">
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between px-2">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Enter Unix Timestamp</h4>
              <Button variant="ghost" size="sm" onClick={useCurrent} className="text-emerald-500 hover:text-white font-black text-[10px] uppercase">
                <RefreshCw size={12} className="mr-2" /> Use Current
              </Button>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full h-20 bg-white/5 border-2 border-white/10 rounded-2xl px-6 text-2xl font-black text-white focus:border-emerald-500 focus:outline-none placeholder:text-slate-700 tabular-nums transition-all"
                placeholder="1741491984"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                seconds or ms
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center px-8 border-l border-white/5">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Live Epoch</p>
            <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
              {Math.floor(now / 1000)}
            </div>
            <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYNCING
            </div>
          </div>
        </div>
      </Card>

      {results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'ISO 8601', value: results.iso, icon: Calendar, color: 'text-blue-500' },
            { label: 'UTC String', value: results.utc, icon: Globe, color: 'text-purple-500' },
            { label: 'Local Time', value: results.local, icon: Clock, color: 'text-emerald-500' },
            { label: 'Relative', value: results.relative, icon: Zap, color: 'text-orange-500' },
          ].map((res, i) => (
            <Card key={i} className="p-6 rounded-3xl border-none bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 group hover:border-blue-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-2xl bg-current/10 ${res.color} flex items-center justify-center`}>
                  <res.icon size={18} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => copy(res.value)} className="h-8 w-8 p-0 text-slate-400 group-hover:text-blue-500">
                  <Copy size={14} />
                </Button>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{res.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 break-all">{res.value}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center opacity-20">
          <Clock size={64} className="mb-4" />
          <p className="font-black uppercase tracking-widest">Enter a valid timestamp above</p>
        </div>
      )}

      <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
        <h5 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4 italic">Developer Quick-View</h5>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
              <span className="text-xs font-bold text-slate-400">SECONDS</span>
              <span className="font-black tabular-nums">{results?.unixSec || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
              <span className="text-xs font-bold text-slate-400">MILLISECONDS</span>
              <span className="font-black tabular-nums">{results?.unixMs || 0}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Our converter automatically detects if the input is in seconds (10 digits) or milliseconds (13 digits), providing instant formatting regardless of the platform source.
            </p>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
