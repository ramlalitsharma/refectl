'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Subject {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface CategorySearchProps {
  categories: string[];
  subjects: Subject[];
  onSearch?: (query: string, category?: string, subject?: string) => void;
}

const getCategoryDisplayName = (category: string) => {
  const displayNames: Record<string, string> = {
    'General': 'Featured Selection',
    'general': 'Featured Selection',
    'academic': 'Academic',
    'professional': 'Professional',
    'language': 'Language',
    'test-prep': 'Test Prep',
    'iq-cognitive': 'IQ & Cognitive',
  };
  return displayNames[category] || category;
};

export function CategorySearch({ categories, subjects, onSearch }: CategorySearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const listboxId = 'categorysearch-suggestions';
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  type Suggestion = { type: 'subject' | 'category'; label: string; value: string; category?: string };

  const subjectsByCategory = useMemo(() => {
    const map = new Map<string, Subject[]>();
    subjects.forEach((subject) => {
      const cat = subject.category || 'General';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(subject);
    });
    return map;
  }, [subjects]);

  // Get available subjects for selected category
  const availableSubjects = selectedCategory
    ? subjectsByCategory.get(selectedCategory) || []
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (subjectRef.current && !subjectRef.current.contains(event.target as Node)) {
        setIsSubjectOpen(false);
      }
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubject(''); // Reset subject when category changes
    setIsCategoryOpen(false);
  };

  const handleSubjectSelect = (subjectSlug: string) => {
    setSelectedSubject(subjectSlug);
    setIsSubjectOpen(false);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedCategory, selectedSubject);
    } else {
      // Default behavior: navigate to search page
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSubject) params.set('subject', selectedSubject);
      router.push(`/search?${params.toString()}`);
    }
  };

  const suggestions: Suggestion[] = (() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    const sourceSubjects = selectedCategory ? (subjectsByCategory.get(selectedCategory) || []) : subjects;
    const matchedSubjects = sourceSubjects
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map((s) => ({ type: 'subject' as const, label: s.name, value: s.slug, category: s.category }));
    const matchedCategories = categories
      .filter((c) => getCategoryDisplayName(c).toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ type: 'category' as const, label: getCategoryDisplayName(c), value: c }));
    return [...matchedCategories, ...matchedSubjects];
  })();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = suggestions[highlightIndex] || suggestions[0];
      if (sel.type === 'subject') {
        setSelectedSubject(sel.value);
      } else if (sel.type === 'category') {
        handleCategorySelect(sel.value);
      }
      handleSearch();
      setShowSuggestions(false);
      setHighlightIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
      {/* Category Dropdown */}
      <div className="relative" ref={categoryRef}>
        <button
          type="button"
          onClick={() => {
            setIsCategoryOpen(!isCategoryOpen);
            setIsSubjectOpen(false);
          }}
          className="w-full md:w-auto min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left flex items-center justify-between hover:border-slate-400 transition"
        >
          <span className="text-slate-700">
            {selectedCategory ? getCategoryDisplayName(selectedCategory) : 'All Categories'}
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isCategoryOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${!selectedCategory ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                }`}
            >
              All Categories
            </button>
            {categories.map((category) => {
              const subjectCount = subjectsByCategory.get(category)?.length || 0;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition flex items-center justify-between ${selectedCategory === category
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-slate-700'
                    }`}
                >
                  <span>{getCategoryDisplayName(category)}</span>
                  {subjectCount > 0 && (
                    <span className="text-xs text-slate-500 ml-2">({subjectCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedCategory && availableSubjects.length > 0 && (
        <div className="relative" ref={subjectRef}>
          <button
            type="button"
            onClick={() => {
              setIsSubjectOpen(!isSubjectOpen);
              setIsCategoryOpen(false);
            }}
            className="w-full md:w-auto min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left flex items-center justify-between hover:border-slate-400 transition"
          >
            <span className="text-slate-700">
              {selectedSubject
                ? availableSubjects.find((s) => s.slug === selectedSubject)?.name || 'All Subjects'
                : 'All Subjects'}
            </span>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSubjectOpen && (
            <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleSubjectSelect('')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${!selectedSubject ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                  }`}
              >
                All Subjects
              </button>
              {availableSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSubjectSelect(subject.slug)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${selectedSubject === subject.slug
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-slate-700'
                    }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className="relative flex-1"
        ref={inputRef}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            const shouldShow = val.trim().length >= 2;
            setShowSuggestions(shouldShow);
            if (!shouldShow) setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, blogs, or exams"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          aria-label="Search courses, blogs, or exams"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={highlightIndex >= 0 ? `${listboxId}-option-${highlightIndex}` : undefined}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {selectedCategory && (
              <div className="sticky top-0 z-10 bg-slate-50 border-b p-2 flex items-center justify-between">
                <span className="text-xs text-slate-600">Filtered by category</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full"
                >
                  {getCategoryDisplayName(selectedCategory)} ×
                </button>
              </div>
            )}
            <div className="divide-y">
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.type}:${s.value}:${idx}`}
                  type="button"
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => {
                    if (s.type === 'subject') {
                      setSelectedSubject(s.value);
                    } else if (s.type === 'category') {
                      handleCategorySelect(s.value);
                    }
                    handleSearch();
                    setShowSuggestions(false);
                    setHighlightIndex(-1);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${highlightIndex === idx ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                    }`}
                  role="option"
                  id={`${listboxId}-option-${idx}`}
                  aria-selected={highlightIndex === idx}
                >
                  <span className="truncate">
                    {s.label}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {s.type === 'subject' ? (s.category || '') : 'Category'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSearch} className="px-6 whitespace-nowrap">
        Search
      </Button>
    </div>
  );
}

