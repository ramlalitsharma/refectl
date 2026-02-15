import Link from 'next/link';
import { SiteBrand } from './SiteBrand';
import { BRAND_NAME } from '@/lib/brand';

const footerLinks = [
  {
    title: 'Platform',
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'Subjects', href: '/subjects' },
      { label: 'Exams', href: '/exams' },
      { label: 'Preparations', href: '/preparations' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#050810] text-slate-300 relative overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8 lg:py-9 grid gap-6 sm:gap-7 lg:gap-8 lg:grid-cols-[1.05fr,1fr] relative z-10">
        <div className="space-y-4 sm:space-y-5">
          <SiteBrand />
          <p className="max-w-md text-xs sm:text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
            {BRAND_NAME} IS THE AI-NATIVE LEARNING INFRASTRUCTURE DELIVERING ADAPTIVE NEURAL PATHWAYS AND REAL-TIME EVALUATION TELEMETRY.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:gap-7 grid-cols-2 sm:grid-cols-3 lg:max-w-2xl lg:justify-self-end w-full">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3 sm:space-y-4">
              <h3 className="text-[11px] sm:text-xs font-black text-white uppercase tracking-[0.22em] sm:tracking-[0.26em]">{group.title}</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="touch-target-sm text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-wide sm:tracking-widest hover:text-white active:text-elite-accent-cyan transition-all flex items-center gap-2 sm:gap-3 group">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/5 group-hover:bg-elite-accent-cyan transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 lg:py-5 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.24em] sm:tracking-[0.3em]">
            © {new Date().getFullYear()} {BRAND_NAME} | CORE SYSTEMS V2.8.0
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-400/90 uppercase tracking-wide sm:tracking-widest">Global Link Stable</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.24em] sm:tracking-[0.3em]">
              NEURAL PROTOCOL ACTIVE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
