'use client';

/**
 * Deprecated: manual in-content ad blocks disabled.
 * Project uses AdSense Auto Ads globally via AdSenseScript.
 */

interface ContentAdProps {
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export function ContentAd({ className = '', label = '', showLabel = true }: ContentAdProps) {
  void className;
  void label;
  void showLabel;
  return null;
}
