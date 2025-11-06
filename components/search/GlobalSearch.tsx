'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { FadeIn } from '@/components/ui/Motion';

interface SearchResult {
  _id: string;
  type: 'course' | 'blog' | 'subject';
  title: string;
  url: string;
  summary?: string;
  excerpt?: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

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
          className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⏳</span>
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((result, idx) => (
                <FadeIn key={result._id} delay={idx * 0.05}>
                  <Link
                    href={result.url}
                    onClick={() => {
                      setShowResults(false);
                      setQuery('');
                    }}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
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

