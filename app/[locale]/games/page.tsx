import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Gamepad2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refectl Games - Coming Soon',
  description: 'Our games are moving to a dedicated platform for better performance.',
};

export default function GamesPlaceholderPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-12">
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Gamepad2 size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Games Are Moving!
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
          We are upgrading our infrastructure. To provide you with the fastest, highest-quality gaming experience, all Refectl games are being migrated to a dedicated gaming server. 
        </p>

        <div className="inline-flex items-center gap-3 bg-slate-100 text-slate-500 px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase mb-10">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Migration in Progress
        </div>

        <div className="flex justify-center">
          <Link 
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Return to Dashboard
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
