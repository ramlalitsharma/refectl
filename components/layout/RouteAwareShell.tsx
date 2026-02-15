'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function isNewsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return false;
  return segments[1] === 'news';
}

export function RouteAwareShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const newsRoute = isNewsPath(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!newsRoute ? (
        <Suspense>
          <Navbar />
        </Suspense>
      ) : null}
      <main className="flex-1">{children}</main>
      {!newsRoute ? <Footer /> : null}
    </div>
  );
}

