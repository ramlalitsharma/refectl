'use client';

export function PlaceholderTool({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
      <p className="font-bold">{title}</p>
      <p>{note}</p>
      <p className="text-xs text-slate-400">
        Server processing is required. Configure a backend worker to enable this feature.
      </p>
    </div>
  );
}

