import { NewsNavbar } from '@/components/layout/NewsNavbar';

export const dynamic = 'force-dynamic';

export default function EditorialPolicyPage() {
  return (
    <div className="news-page-shell news-paper-theme min-h-screen">
      <NewsNavbar />
      <main className="news-viewport px-4 md:px-8 py-10">
        <section className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-3">
            <p className="news-kicker">Editorial Standards</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Terai Times Editorial Policy</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This policy explains how we gather, verify, attribute, and publish news across Terai Times.
            </p>
          </header>

          <div className="space-y-6 text-[15px] leading-7 text-slate-700 dark:text-slate-300">
            <section className="space-y-2">
              <h2 className="text-xl font-bold">1. Accuracy and Verification</h2>
              <p>
                We prioritize verifiable reporting. Automated drafts are reviewed by editors or flagged for approval
                before publication when source credibility is uncertain.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">2. Source Attribution</h2>
              <p>
                When stories are based on external reporting or discovery feeds, we display the source name and link
                on the article page. For original reporting, the source is listed as Terai Times.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">3. Automation Governance</h2>
              <p>
                Automated intelligence drafting uses a verified pipeline with source validation and safety checks.
                Articles from unknown sources are flagged for editorial review.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">4. Corrections and Updates</h2>
              <p>
                Material errors are corrected promptly. Updates are timestamped on the article page.
                Significant corrections are disclosed within the story.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold">5. Ethical Standards</h2>
              <p>
                We avoid sensationalism, respect privacy, and do not accept compensation for editorial coverage.
                Sponsored content is clearly labeled.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
