import { requireContentWriter } from '@/lib/admin-check';
import { getSourceHosts } from '@/lib/source-trust-store';
import { addTrustedSourceAction, removeTrustedSourceAction, addBlockedSourceAction, removeBlockedSourceAction } from '@/app/actions/source-trust';

export const dynamic = 'force-dynamic';

export default async function SourceTrustDashboardPage() {
  await requireContentWriter();
  const trusted = await getSourceHosts('trusted');
  const blocked = await getSourceHosts('blocked');

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 p-8 lg:p-12 space-y-10">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">Source Trust</p>
        <h1 className="text-4xl font-black text-white">Source Trust Dashboard</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Manage allowlisted and blocked sources used for automated and manual ingestion.
        </p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-card-premium p-8 rounded-[2rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Trusted Sources</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 font-black">{trusted.length} Hosts</span>
          </div>

          <form action={addTrustedSourceAction} className="flex flex-col md:flex-row gap-3">
            <input
              name="host"
              placeholder="Add hostname or URL"
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-200"
            />
            <button className="px-6 py-3 rounded-xl bg-elite-accent-emerald text-black font-black uppercase tracking-[0.25em] text-[10px]" type="submit">
              Add
            </button>
          </form>

          <div className="space-y-3">
            {trusted.length ? trusted.map((host) => (
              <div key={host} className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-white">{host}</span>
                <form action={removeTrustedSourceAction}>
                  <input type="hidden" name="host" value={host} />
                  <button className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No trusted sources added yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card-premium p-8 rounded-[2rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Blocked Sources</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-red-300 font-black">{blocked.length} Hosts</span>
          </div>

          <form action={addBlockedSourceAction} className="flex flex-col md:flex-row gap-3">
            <input
              name="host"
              placeholder="Block hostname or URL"
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-200"
            />
            <button className="px-6 py-3 rounded-xl bg-red-400 text-black font-black uppercase tracking-[0.25em] text-[10px]" type="submit">
              Block
            </button>
          </form>

          <div className="space-y-3">
            {blocked.length ? blocked.map((host) => (
              <div key={host} className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-white">{host}</span>
                <form action={removeBlockedSourceAction}>
                  <input type="hidden" name="host" value={host} />
                  <button className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No blocked sources.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
