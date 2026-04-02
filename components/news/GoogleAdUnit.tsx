'use client';

import { useEffect, useState } from 'react';

/**
 * Universal safe AdSense wrapper specifically designed to operate inside Next.js App Router loops.
 */
export function GoogleAdUnit({
  className = '',
  adSlot,
  format = 'auto',
  responsive = 'true',
}: {
  className?: string;
  adSlot: string; // The ID of the ad unit from AdSense
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
}) {
  const [mounted, setMounted] = useState(false);
  const publisherId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  // Next.js hydration safety wrapper
  useEffect(() => {
    setMounted(true);
    if (!publisherId) return;

    // Push the Ad into Google's queue only after mount
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error('AdSense Initialization Guard:', err);
      }
    }, 150);
  }, [publisherId]);

  // Dev placeholder if no actual AdSense ID is provided locally.
  if (!publisherId) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#080b12]/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-slate-400 text-xs tracking-[0.15em] uppercase font-bold min-h-[120px] shadow-inner w-full overflow-hidden ${className}`}>
        [ Advertisement Slot placeholder ]
        <br />
        <span className="text-[9px] mt-1 text-slate-300 dark:text-slate-600 font-medium">Slot ID: {adSlot} • Edit NEXT_PUBLIC_GOOGLE_ADSENSE_ID</span>
      </div>
    );
  }

  if (!mounted) {
    return <div className={`min-h-[120px] bg-slate-100/30 dark:bg-slate-900/10 animate-pulse rounded-lg w-full ${className}`} />;
  }

  return (
    <div className={`google-ad-container w-full overflow-hidden relative ${className}`}>
      <span className="block text-[8px] text-right font-black uppercase text-slate-300 dark:text-slate-600 tracking-widest mb-1.5 -mt-1 select-none pr-2">Advertisement</span>
      <ins
        className="adsbygoogle block !m-0 !p-0 max-w-full"
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
