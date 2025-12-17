'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 space-y-3">
          <div className="h-6 w-40 bg-slate-200 rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 w-24 bg-slate-200 rounded-full" />
            ))}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-10">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle>
                    <div className="h-5 w-48 bg-slate-200 rounded" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

