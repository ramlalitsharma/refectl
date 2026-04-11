'use client';

import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';
import { Link } from '@/lib/navigation';

interface AnimatedArticleBodyProps {
  content: string;
  impactScore?: number;
  isPremium?: boolean;
}

export function AnimatedArticleBody({ content, impactScore, isPremium }: AnimatedArticleBodyProps) {
  if (isPremium) {
    return (
      <div className="relative group/premium">
        <div 
          className="nda-body blur-md select-none pointer-events-none transition-all group-hover/premium:blur-sm"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[var(--news-bg)] via-transparent to-transparent">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-24 p-8 max-w-md text-center shadow-2xl animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Lock className="text-slate-950" size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Locked Analysis</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              This is a high-impact intelligence report with a strategic score of <span className="text-amber-500 font-bold">{impactScore}/100</span>. Full access requires a premium intelligence membership.
            </p>
            <Link href="/news/subscribe" className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-colors shadow-lg">
              <Zap size={14} className="fill-slate-950" />
              Unlock Full Brief
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="nda-body"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
