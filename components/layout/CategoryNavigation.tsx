'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Category {
  name: string;
  slug: string;
  count?: number;
  icon?: string;
}

interface CategoryNavigationProps {
  categories: Category[];
  currentCategory?: string;
  basePath?: string;
}

export function CategoryNavigation({ categories, currentCategory, basePath = '/courses' }: CategoryNavigationProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || currentCategory || null;

  if (categories.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-2 min-w-max">
        <Link
          href={basePath}
          className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
            !activeCategory
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span>All</span>
          {!activeCategory && <span className="text-xs opacity-80">({categories.reduce((sum, cat) => sum + (cat.count || 0), 0)})</span>}
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`${basePath}?category=${encodeURIComponent(category.name)}`}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === category.name
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
            {category.count !== undefined && (
              <span className={`text-xs ${activeCategory === category.name ? 'opacity-80' : 'opacity-60'}`}>
                ({category.count})
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

