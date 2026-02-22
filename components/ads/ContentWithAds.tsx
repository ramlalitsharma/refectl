'use client';

import { ReactNode } from 'react';

interface ContentWithAdsProps {
  children: ReactNode;
  isPro?: boolean;
  type?: 'blog' | 'news' | 'article';
  numberOfAds?: number; // Default 2
}

/**
 * Deprecated: manual in-content ad injection disabled.
 * Project uses AdSense Auto Ads globally via AdSenseScript.
 */
export function ContentWithAds({
  children,
  isPro = false,
  type = 'article',
  numberOfAds = 2,
}: ContentWithAdsProps) {
  void isPro;
  void type;
  void numberOfAds;
  return <article className="max-w-4xl mx-auto">{children}</article>;
}
