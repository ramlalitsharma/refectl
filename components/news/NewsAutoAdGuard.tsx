'use client';

import { useEffect } from 'react';

const AD_SELECTORS = [
  '.google-auto-placed',
  'ins.adsbygoogle',
  'ins.adsbygoogle-noablate',
  '[id^="aswift_"]',
  '[id^="google_ads_iframe"]',
  'iframe[src*="googlesyndication.com"]',
].join(', ');

function stripNewsAds() {
  const container = document.querySelector('.no-auto-ads-on-news');
  if (!container) return;

  const nodes = container.querySelectorAll<HTMLElement>(AD_SELECTORS);
  nodes.forEach((node) => {
    const wrapper = node.closest('.google-auto-placed') as HTMLElement | null;
    if (wrapper) {
      wrapper.remove();
      return;
    }
    node.remove();
  });
}

export function NewsAutoAdGuard() {
  useEffect(() => {
    stripNewsAds();

    const observer = new MutationObserver(() => {
      stripNewsAds();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

