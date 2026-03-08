import { NewsNavbar } from '@/components/layout/NewsNavbar';

export const dynamic = 'force-dynamic';

export default function DisclosuresPage() {
  return (
    <div className="news-page-shell news-paper-theme min-h-screen">
      <NewsNavbar />
      <main className="news-viewport px-4 md:px-8 py-10">
        <section className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-3">
            <p className="news-kicker">Disclosures</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Advertising and Affiliate Disclosure</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Transparency about monetization, sponsored content, and external links.
            </p>
          </header>

          <div className="space-y-6 text-[15px] leading-7 text-slate-700 dark:text-slate-300">
            <section className="space-y-2">
              <h2 className="text-xl font-bold">Sponsored Content</h2>
              <p>
                Sponsored placements and partner insights are clearly labeled. Sponsored content does not influence
                our editorial decisions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">Affiliate Links</h2>
              <p>
                Some outbound links may be affiliate links. If you click and make a purchase, we may receive a commission.
                This does not affect our coverage or rankings.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">External Sources</h2>
              <p>
                External source links are provided for transparency and attribution. Terai Times is not responsible
                for the content of external sites.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">Live and Automated Content</h2>
              <p>
                Some content may be updated automatically or assembled from trusted external signals. We clearly
                label automated workflows, source links, and refresh intervals where relevant. This content is
                provided for informational use only.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
