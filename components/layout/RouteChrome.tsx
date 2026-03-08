'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname() || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  const showGlobalNavbar = mounted;

  return (
    <div className="flex min-h-screen flex-col">
      {showGlobalNavbar ? (
        <Suspense>
          <Navbar />
        </Suspense>
      ) : null}

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
