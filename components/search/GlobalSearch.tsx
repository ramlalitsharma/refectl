'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FadeIn } from '@/components/ui/Motion';

interface SearchResult {
  _id: string;
  type: 'course' | 'blog' | 'subject';
  title: string;
  url: string;
  summary?: string;
  excerpt?: string;
  category?: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(query)}&limit=10${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
        
        // Extract unique categories from results
        const categories = Array.from(new Set((data.results || []).map((r: SearchResult) => r.category).filter(Boolean))) as string[];
        setAvailableCategories(categories);
        
        setShowResults(true);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedCategory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return '📚';
      case 'blog': return '📝';
      case 'subject': return '📖';
      default: return '🔍';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Search courses, blogs, subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full bg-transparent border-0 px-4 py-3 pl-10 pr-20 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        {loading && (
          <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400">⏳</span>
        )}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full hover:bg-teal-200 transition-colors"
            title="Clear category filter"
          >
            {selectedCategory} ×
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {availableCategories.length > 0 && !selectedCategory && (
              <div className="p-3 border-b bg-slate-50 flex flex-wrap gap-2">
                <span className="text-xs text-slate-600 font-medium self-center">Filter by:</span>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-full hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            <div className="divide-y">
              {results.map((result, idx) => (
                <FadeIn key={result._id} delay={idx * 0.05}>
                  <Link
                    href={result.url}
                    onClick={() => {
                      setShowResults(false);
                      setQuery('');
                      setSelectedCategory('');
                    }}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white truncate flex-1">
                            {result.title}
                          </div>
                          {result.category && (
                            <Badge variant="info" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {result.summary || result.excerpt || ''}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {result.type}
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <Card className="absolute top-full mt-2 w-full z-50">
          <CardContent className="p-4 text-center text-gray-600 dark:text-gray-400">
            No results found for "{query}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}

