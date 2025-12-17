'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Using simple arrow instead of lucide-react icon

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const paths = pathname?.split('/').filter(Boolean) || [];
    const generated: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      generated.push({
        label,
        href: index === paths.length - 1 ? undefined : currentPath,
      });
    });
    
    return generated;
  })();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center gap-2 text-sm text-slate-600 ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-teal-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-slate-900 font-medium' : ''}>{item.label}</span>
            )}
            {!isLast && <span className="text-slate-400">›</span>}
          </div>
        );
      })}
    </nav>
  );
}

