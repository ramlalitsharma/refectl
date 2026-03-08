import { requireContentWriter } from '@/lib/admin-check';
import { runApprovalQueueNowAction, runMaintenanceNowAction, runRoamingScrapeNowAction } from '@/app/actions/news-scheduler';

export const dynamic = 'force-dynamic';

export default async function NewsSchedulerPage() {
  await requireContentWriter();

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 p-8 lg:p-12 space-y-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">Automation Scheduler</p>
        <h1 className="text-4xl font-black text-white">News Scrape Scheduler</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Trigger the global roaming engine, approval queue, and maintenance tasks. For production, connect your cron
          provider to the cron endpoints.
        </p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-card-premium p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-2xl font-black text-white">Manual Controls</h2>

          <form action={runRoamingScrapeNowAction} className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">
              Global Roaming Engine
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                name="count"
                defaultValue="1"
                className="w-32 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-200"
              />
              <button className="px-6 py-3 rounded-xl bg-elite-accent-cyan text-black font-black uppercase tracking-[0.25em] text-[10px]" type="submit">
                Run Now
              </button>
            </div>
          </form>

          <form action={runApprovalQueueNowAction} className="flex items-center gap-3">
            <button className="px-6 py-3 rounded-xl border border-white/10 text-[10px] uppercase tracking-[0.25em] font-black" type="submit">
              Notify Approval Queue
            </button>
          </form>

          <form action={runMaintenanceNowAction} className="flex items-center gap-3">
            <button className="px-6 py-3 rounded-xl border border-white/10 text-[10px] uppercase tracking-[0.25em] font-black" type="submit">
              Run Maintenance
            </button>
          </form>
        </div>

        <div className="glass-card-premium p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-2xl font-black text-white">Cron Endpoints</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <p>Hourly automation cycle:</p>
            <code className="block bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300">
              GET /api/cron/news-automation (Auth: Bearer CRON_SECRET)
            </code>
            <p>Weekly maintenance:</p>
            <code className="block bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300">
              GET /api/cron/news-maintenance (Auth: Bearer CRON_SECRET)
            </code>
            <p className="text-[12px] text-slate-500">
              Set CRON_SECRET in environment variables and configure your scheduler (e.g., Cloudflare, GitHub Actions,
              Render, or Vercel Cron) to hit these endpoints.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
