import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';

export function SiteBrand({ variant = 'default', className = '' }: { variant?: 'default' | 'light' | 'dark'; className?: string }) {
  const base = 'text-2xl font-black tracking-tighter';
  const color =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
        ? 'text-slate-950 dark:text-white'
        : 'text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity';
  return (
    <Link href="/" className={`${base} ${color} ${className}`}>
      {BRAND_NAME}
    </Link>
  );
}


