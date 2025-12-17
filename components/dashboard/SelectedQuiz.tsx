'use client';

import { useState } from 'react';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
      <div className="p-6 rounded-xl border bg-white text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a subject to begin</h3>
        <p className="text-sm text-gray-600 mb-4">Select a subject, level and chapter to start an adaptive quiz.</p>
        <Link href="/subjects">
          <Button>Browse Subjects</Button>
        </Link>
      </div>
    );
  }

  return <AdaptiveQuiz topic={selection.subjectName} />;
}


