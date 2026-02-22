'use client';

interface AutoAdsProps {
  isPro?: boolean;
  pageType?: 'home' | 'blog' | 'news' | 'shop' | 'course' | 'default';
}

/**
 * Deprecated: manual ad placement disabled.
 * Project uses AdSense Auto Ads globally via AdSenseScript.
 */
export function AutoAds({ isPro = false, pageType = 'default' }: AutoAdsProps) {
  void isPro;
  void pageType;
  return null;
}
