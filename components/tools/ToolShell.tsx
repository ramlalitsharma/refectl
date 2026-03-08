'use client';

import { ReactNode } from 'react';
import { Link } from '@/lib/navigation';

type ToolShellProps = {
  title: string;
  description: string;
  backHref?: string;
  children: ReactNode;
};

export function ToolShell({ title, description, backHref = '/tools', children }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-3">
          <Link href={backHref} className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-elite-accent-cyan">
            ← Back to Utilities
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            {description}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-elite-surface p-6 md:p-10 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

