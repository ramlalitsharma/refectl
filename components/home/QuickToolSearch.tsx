'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Zap, ArrowRight, X } from 'lucide-react';
import { TOOLS, ICO_MAP } from '@/lib/tools-registry';
import { Link } from '@/lib/navigation';

export function QuickToolSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredTools = query.trim() === ''
        ? TOOLS.filter(t => t.trending).slice(0, 6)
        : TOOLS.filter(t =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto relative z-50 text-left" ref={containerRef}>
            <div className={`relative transition-all duration-300 ${isOpen ? 'scale-[1.02]' : ''}`}>
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                    <div className="pl-6 pr-3 text-slate-400">
                        <Search className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search 500+ free online tools..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold p-4 text-lg md:text-xl placeholder:text-slate-400"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="p-2 mr-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button className="hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        <Zap className="w-4 h-4 fill-current" />
                        Rapid Access
                    </button>
                </div>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-slate-50 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">
                            {query.trim() === '' ? '🔥 Trending Tools' : `🔍 Results for "${query}"`}
                        </span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                        {filteredTools.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-2">
                                {filteredTools.map((tool) => (
                                    <Link
                                        key={tool.slug}
                                        href={`/tools/${tool.slug}`}
                                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-blue-500/20"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <tool.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors uppercase text-xs tracking-tight">{tool.title}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{tool.shortDesc}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                    <Search className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-slate-500 font-bold">No tools found matching your search.</p>
                                <Link href="/tools" className="text-blue-500 font-black uppercase text-[10px] tracking-widest hover:underline">
                                    Browse All Categories →
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-medium">Everything processed 100% in your browser.</p>
                        <Link href="/tools" className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                            Explore Hub <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
