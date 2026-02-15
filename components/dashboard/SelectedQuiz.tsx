'use client';

import { useState } from 'react';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Target } from 'lucide-react';

export function SelectedQuiz() {
  const [selection] = useState<{ subjectName?: string } | null>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('adaptiq-subject-selection') : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  if (!selection?.subjectName) {
    return (
      <div className="glass-card-premium rounded-[2.5rem] p-12 text-center border border-white/5">
        <div className="flex justify-center mb-6">
          <Target className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Subject Selection Required</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 leading-relaxed max-w-[240px] mx-auto">
          INITIALIZE A SPECIFIC NEURAL PATHWAY TO BEGIN ADAPTIVE EVALUATION
        </p>
        <Link href="/subjects">
          <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl px-8">
            Access Manifest
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
      <div className="mb-8 border-b border-white/5 pb-6">
        <div className="text-[8px] font-black text-elite-accent-cyan uppercase tracking-[0.4em] mb-1">Active Neural Stream</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selection.subjectName}</h2>
      </div>
      <AdaptiveQuiz topic={selection.subjectName} />
    </div>
  );
}
