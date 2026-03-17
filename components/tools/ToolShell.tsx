import { ReactNode } from 'react';
import { Link } from '@/lib/navigation';
import { ToolMetadata } from '@/lib/tools-registry';
import { Wrench } from 'lucide-react';

type ToolShellProps = {
  tool?: ToolMetadata;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  seoContent?: ToolMetadata['seoContent'];
  children: ReactNode;
  backHref?: string;
};

const defaultSeoContent = (title: string): ToolMetadata['seoContent'] => ({
  howTo: [
    `Open the ${title} tool.`,
    'Adjust the settings for your needs.',
    'Generate the result instantly.',
    'Download or copy the output.',
  ],
  faq: [
    { q: `Is ${title} free to use?`, a: 'Yes. All processing happens locally in your browser.' },
    { q: 'Do my files get uploaded?', a: 'No. Your data stays on your device.' },
  ],
  benefits: ['Fast', 'Private', 'No sign-up', 'Works on all devices'],
});

export function ToolShell({ tool, title, description, icon, seoContent, backHref = '/tools', children }: ToolShellProps) {
  const resolvedTitle = tool?.title ?? title ?? 'Utility Tool';
  const resolvedDescription = tool?.description ?? description ?? 'Professional browser-first utilities built for speed and privacy.';
  const ResolvedIcon = tool?.icon ?? icon ?? Wrench;
  const resolvedSeo = tool?.seoContent ?? seoContent ?? defaultSeoContent(resolvedTitle);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Tool Header Block */}
        <div className="space-y-4">
          <Link href={backHref} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Utilities Hub
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <ResolvedIcon className="w-8 h-8 text-blue-500" />
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {resolvedTitle}
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg font-medium">
                {resolvedDescription}
              </p>
            </div>

            {/* Ad Placement: Header Right (Optional on Desktop) */}
            <div className="hidden lg:block w-[300px] h-[100px] bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Header Ad Slot</span>
            </div>
          </div>
        </div>

        {/* Ad Placement: Above Tool */}
        <div className="w-full h-[90px] bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Ad Slot - Leaderboard</span>
        </div>

        {/* Main Tool Interface */}
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-6 md:p-12 shadow-2xl shadow-blue-500/5 ring-1 ring-black/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
          {children}
        </div>

        {/* Ad Placement: Below Tool/Result */}
        <div className="w-full min-h-[250px] bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Main Content Ad Slot</span>
        </div>

        {/* SEO Marketing Sections */}
        <div className="grid lg:grid-cols-3 gap-12 pt-12 border-t border-slate-200 dark:border-white/5">
          <div className="lg:col-span-2 space-y-16">
            {/* How to Use Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">How to use {resolvedTitle}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {resolvedSeo.howTo.map((step, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-xs">{i + 1}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {resolvedSeo.faq.map((item, i) => (
                  <details key={i} className="group p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer">
                    <summary className="list-none flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      {item.q}
                      <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    </summary>
                    <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed antialiased">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-12">
            {/* Benefits Card */}
            <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
              <h3 className="text-xl font-black uppercase tracking-widest mb-6">Why Refectl?</h3>
              <ul className="space-y-4">
                {resolvedSeo.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    <span className="font-bold text-sm tracking-tight">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar Ad Placement */}
            <div className="w-full min-h-[600px] bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center sticky top-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Vertical Banner Ad Slot<br />(Sticky)</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ToolShell;
