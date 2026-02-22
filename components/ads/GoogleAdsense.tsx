'use client';

/**
 * Deprecated: manual slot rendering disabled.
 * Project uses AdSense Auto Ads globally via AdSenseScript.
 */

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
}

export function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = ''
}: GoogleAdsenseProps) {
  void adSlot;
  void adFormat;
  void fullWidthResponsive;
  void className;
  return null;
}
