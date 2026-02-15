'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, BookOpen, CheckCircle2, Lightbulb, WifiOff, Zap } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const lastPath = typeof window !== 'undefined' ? sessionStorage.getItem('lastOnlinePath') : null;

  useEffect(() => {
    if (isOnline) {
      const target = lastPath && lastPath !== '/offline' ? lastPath : '/';
      router.replace(target);
    }
  }, [isOnline, lastPath, router]);

  const handleRetry = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 via-teal-500 to-teal-600 text-white">
      <header className="border-b border-white/20 bg-teal-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-semibold">Refectl</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10" onClick={handleRetry}>
              Try Again
            </Button>
            <Link href={lastPath && lastPath !== '/offline' ? lastPath : '/'}>
              <Button variant="inverse" size="sm" className="bg-white text-teal-700 hover:bg-white/90">
                Return
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-8">
        <section className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-8 text-center shadow-xl">
          <div className="flex justify-center mb-4">
            <WifiOff className="h-12 w-12 text-white/90" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">You&apos;re Offline</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            It looks like you&apos;ve lost your internet connection. Please check your network and try again.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleRetry}>
              Retry Connection
            </Button>
            <Link href={lastPath && lastPath !== '/offline' ? lastPath : '/'}>
              <Button variant="inverse" className="bg-white text-teal-700 hover:bg-white/90">
                Return
              </Button>
            </Link>
          </div>
          <div className="mt-4 text-sm">
            {isOnline ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Back online
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100/80 px-3 py-1 text-red-700">
                <AlertTriangle className="h-4 w-4" /> Still offline
              </span>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Lightbulb className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-2">
              <ul className="space-y-2 text-sm">
                <li>• Check Wi‑Fi or mobile data and reconnect.</li>
                <li>• Toggle airplane mode off and on.</li>
                <li>• If using a VPN, try disconnecting temporarily.</li>
                <li>• Reload the page once your connection is restored.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <BookOpen className="h-5 w-5" />
                Explore Offline-Friendly Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 text-sm space-y-3">
              <p>Once online, continue your journey from these sections:</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/courses" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-teal-50 hover:border-teal-300">Courses</Link>
                <Link href="/subjects" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-teal-50 hover:border-teal-300">Subjects</Link>
                <Link href="/live" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-teal-50 hover:border-teal-300">Live Classes</Link>
                <Link href="/dashboard" className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-teal-50 hover:border-teal-300">My Dashboard</Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-white/90 text-sm">Refectl is the AI-native learning platform delivering adaptive learning paths, certification workflows, and real‑time analytics.</div>
            <div className="flex gap-2">
              <a href="https://www.linkedin.com" className="text-white/90 hover:text-white">LinkedIn</a>
              <a href="https://twitter.com" className="text-white/90 hover:text-white">Twitter</a>
              <a href="https://youtube.com" className="text-white/90 hover:text-white">YouTube</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
