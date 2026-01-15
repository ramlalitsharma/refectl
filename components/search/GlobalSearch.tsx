'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';
import { Search, X, Command, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close search on escape key or shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(query)}&limit=10${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);

        const categories = Array.from(new Set((data.results || []).map((r: SearchResult) => r.category).filter(Boolean))) as string[];
        setAvailableCategories(categories);
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

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNavigation = (url: string) => {
    handleClose();
    router.push(url);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-center h-10 w-10 sm:w-48 sm:justify-start sm:px-3 rounded-xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 transition-all duration-200 group"
        aria-label="Search site"
      >
        <Search className="h-4 w-4 text-slate-500 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white" />
        <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 dark:text-white/50 group-hover:text-slate-600 dark:group-hover:text-white/80 transition-colors">
          Search...
        </span>
        <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-5 w-8 items-center justify-center rounded border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-white/5 text-[10px] font-medium text-slate-400 dark:text-white/50 pointer-events-none">
          <span className="text-[10px]">⌘K</span>
        </kbd>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 sm:p-8 pt-[10vh] overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <ScaleIn className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search courses, lessons, topics..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-lg placeholder:text-slate-400 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Deep-searching the content...</p>
                </div>
              )}

              {/* Filters */}
              {!loading && availableCategories.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 self-center ml-2">Filters</span>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${selectedCategory === cat
                        ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((result, idx) => (
                    <FadeIn key={result._id} delay={idx * 0.05}>
                      <button
                        onClick={() => handleNavigation(result.url)}
                        className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-4 group"
                      >
                        <span className="text-2xl mt-1 block transform group-hover:scale-125 transition-transform duration-200">
                          {getTypeIcon(result.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-950 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {result.title}
                            </span>
                            {result.category && (
                              <Badge variant="info" className="text-[10px] uppercase font-black tracking-tighter">
                                {result.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                            {result.summary || result.excerpt || 'Learn more about this topic in our platform.'}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {result.type}
                            </div>
                          </div>
                        </div>
                      </button>
                    </FadeIn>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-16 text-center">
                  <div className="bg-slate-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg">No Results Found</h3>
                  <p className="text-slate-500 mt-1">We couldn't find any matches for "{query}"</p>
                </div>
              )}

              {/* Initial State */}
              {!loading && query.length < 2 && (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                  <Command className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">Type at least 2 characters to start searching...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <div className="flex gap-4 px-2">
                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-[9px]">ENTER</kbd> Select</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-[9px]">ESC</kbd> Close</span>
              </div>
              <div className="px-2">Refintl Intelligence Search</div>
            </div>
          </ScaleIn>
        </div>
      )}
    </>
  );
}


