'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function isNewsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const segments = pathname.toLowerCase().split('/').filter(Boolean);
  if (segments.includes('admin') || segments.includes('studio')) return false;
  return segments.includes('news');
}

function isStudioPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const segments = pathname.toLowerCase().split('/').filter(Boolean);
  return segments.includes('studio');
}

export function RouteAwareShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const newsRoute = isNewsPath(pathname);
  const studioRoute = isStudioPath(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showGlobalNavbar = mounted && !newsRoute && !studioRoute;
  const showGlobalFooter = mounted && !newsRoute && !studioRoute;

  return (
    <div className="flex min-h-screen flex-col">
      {showGlobalNavbar ? (
        <Suspense fallback={<div className="h-20" />}>
          <Navbar />
        </Suspense>
      ) : null}
      <main className="flex-1">{children}</main>
      {showGlobalFooter ? <Footer /> : null}
    </div>
  );
}
