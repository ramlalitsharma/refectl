'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function isNewsPath(pathname: string | null): boolean {
  if (!pathname) return false;

  // Normalize pathname
  const normalizedPath = pathname.toLowerCase();

  // Direct check for news segments reliably across locales
  const segments = normalizedPath.split('/').filter(Boolean);

  // Do not treat admin/newsroom/studio paths as public news.
  if (segments.includes('admin') || segments.includes('studio')) {
    return false;
  }

  // Check if "news" is a top-level segment (after locale) or any segment
  // e.g., /news, /en/news, /news/article, etc.
  return segments.includes('news');
}

export function RouteAwareShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const newsRoute = isNewsPath(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showGlobalNavbar = mounted && !newsRoute;

  return (
    <div className="flex min-h-screen flex-col">
      {showGlobalNavbar ? (
        <Suspense fallback={<div className="h-20" />}>
          <Navbar />
        </Suspense>
      ) : null}
      <main className="flex-1">{children}</main>
      {mounted ? <Footer /> : null}
    </div>
  );
}
