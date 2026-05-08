'use client';

import React, { useEffect } from 'react';

interface AdSenseProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Institutional AdSense Component
 * High-performance ad delivery unit optimized for the Terai Times intelligence grid.
 */
export const InstitutionalAdUnit: React.FC<AdSenseProps> = ({
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-placeholder',
  slot = 'default-slot',
  format = 'auto',
  responsive = 'true',
  className = '',
  style = { display: 'block' }
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[AdSense] Ad delivery failed or was blocked by the client.', e);
    }
  }, []);

  return (
    <div className={`adsense-unit-wrapper my-8 overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] ${className}`}>
      <div className="px-6 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Sponsored Intelligence</span>
        <span className="text-[9px] font-medium text-gray-600 italic">Institutional Partner</span>
      </div>
      <div className="p-4 flex items-center justify-center min-h-[100px]">
        {/* AdSense Implementation */}
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
};

export const AutoAdSenseScript = () => {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-placeholder';
  
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
};
