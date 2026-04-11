import React from 'react';

export default function NewsLoading() {
  return (
    <div className="news-page-shell news-paper-theme min-h-screen">
      {/* Skeleton Navbar Height */}
      <div className="h-[72px] w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl" />

      <main className="w-full max-w-none no-auto-ads-on-news pb-0 pt-0">
        {/* Global Stage Hero Skeleton */}
        <div className="intel-skeleton-hero intel-skeleton relative flex items-end p-12 md:p-24">
          <div className="space-y-4 w-full max-w-4xl">
            <div className="h-4 w-24 intel-skeleton bg-cyan-500/20" />
            <div className="h-16 w-full intel-skeleton" />
            <div className="h-16 w-2/3 intel-skeleton" />
            <div className="flex gap-4 pt-4">
              <div className="h-6 w-32 intel-skeleton rounded-full" />
              <div className="h-6 w-32 intel-skeleton rounded-full" />
            </div>
          </div>
        </div>

        {/* Intelligence Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 px-4 md:px-8 py-12">
          <div className="lg:col-span-8 space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="intel-card-modern border-b border-white/5 pb-8 space-y-4">
                <div className="h-4 w-20 intel-skeleton" />
                <div className="h-8 w-3/4 intel-skeleton" />
                <div className="h-4 w-1/2 intel-skeleton" />
                <div className="flex gap-6 pt-2">
                  <div className="h-3 w-16 intel-skeleton" />
                  <div className="h-3 w-16 intel-skeleton" />
                  <div className="h-3 w-16 intel-skeleton" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Skeletons */}
          <div className="lg:col-span-4 hidden lg:block space-y-12 pl-8 border-l border-white/5">
            <div className="space-y-4">
              <div className="h-4 w-32 intel-skeleton mb-6" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full intel-skeleton rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-4 w-32 intel-skeleton mb-6" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 w-full intel-skeleton rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Network Status Overlay */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/80">
            Establishing Flux Link...
          </span>
        </div>
      </div>
    </div>
  );
}
