'use client';

import { useEffect } from 'react';

export function CleanUrl() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.search || url.hash) {
      url.search = '';
      url.hash = '';
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  return null;
}

