"use client";

import { format } from "date-fns";
import { Link } from "@/lib/navigation";
import { Search, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function NewsNavbar() {
    const [dateString, setDateString] = useState("");
    
    useEffect(() => {
        setTimeout(() => setDateString(format(new Date(), "EEEE, MMMM dd, yyyy")), 0);
    }, []);

    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'All';
    const currentCountry = searchParams.get('country') || 'All';
    const coreCategories = ['Home', 'World', 'Politics', 'Business'];
    const moreCategories = ['Opinion', 'Tech', 'Culture', 'Science', 'Sports', 'Health', 'Style'];
    const allCategorySet = new Set([...coreCategories.filter(c => c !== 'Home'), ...moreCategories, 'All']);
    const moreCategoriesDynamic = allCategorySet.has(currentCategory) || currentCategory === 'Home'
        ? moreCategories
        : [currentCategory, ...moreCategories];
    const countriesBase = ['All', 'Nepal', 'USA', 'India', 'UK', 'Australia', 'Japan', 'China'];
    const countryList = countriesBase.includes(currentCountry) ? countriesBase : [currentCountry, ...countriesBase];

    return (
        <header className="relative z-40 border-b border-slate-200/90 dark:border-slate-700/80 bg-[#fdfdfc]/95 dark:bg-slate-950/90 supports-[backdrop-filter]:bg-[#fdfdfc]/85 dark:supports-[backdrop-filter]:bg-slate-950/75 backdrop-blur news-paper-theme">
            {/* Top Utility Strip */}
            <div className="border-b border-slate-100 dark:border-slate-800 py-2 bg-slate-50/70 dark:bg-slate-900/70">
                <div className="news-viewport px-4 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="min-w-[150px]">{dateString}</span>
                        <span className="hidden md:inline-flex items-center gap-1">
                            <Globe size={10} /> Terai Pulse: High
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-red-700 transition-colors">Digital Edition</button>
                        <button className="hover:text-red-700 transition-colors border-l pl-4 border-slate-200">Intelligence Terminal</button>
                    </div>
                </div>
            </div>

            {/* Main Brand & Nav Container */}
            <div className="news-viewport px-4 py-5 md:py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                    {/* Search Icon (Desktop Left) */}
                    <button className="hidden md:block p-2 text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                        <Search size={20} />
                    </button>

                    {/* Centered Brand Logo */}
                    <Link href="/news" className="flex flex-col items-center group">
                        <div className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-red-700 font-serif">
                            Terai Times
                        </div>
                        <div className="text-[10px] md:text-xs uppercase font-black tracking-[0.26em] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-slate-200 dark:bg-slate-700"></span>
                            Refectl Intelligence Agency
                            <span className="w-12 h-[1px] bg-slate-200 dark:bg-slate-700"></span>
                        </div>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/news/subscribe" className="bg-red-700 text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-500/10">
                            Subscribe
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition-colors md:hidden">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                <nav className="mt-7 flex items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-3">
                    <ul className="flex items-center gap-1 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0 text-[12px] md:text-sm font-black uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                        {coreCategories.map(item => {
                            const href = item === 'Home'
                                ? `/news${currentCountry !== 'All' ? `?country=${currentCountry}` : ''}`
                                : `/news?category=${item}${currentCountry !== 'All' ? `&country=${currentCountry}` : ''}`;

                            return (
                                <li key={item}>
                                    <Link
                                        href={href}
                                        className={`hover:text-red-700 dark:hover:text-red-400 transition-colors whitespace-nowrap px-2 ${currentCategory === item ? 'text-red-700 dark:text-red-400 font-black' : ''}`}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* More Categories Dropdown */}
                        <li className="ml-2 border-l pl-4 border-slate-200 dark:border-slate-700 relative group/more">
                            <button className={`flex items-center gap-1 hover:text-red-700 dark:hover:text-red-400 transition-colors uppercase py-1 ${moreCategoriesDynamic.includes(currentCategory) ? 'text-red-700 dark:text-red-400 font-black' : ''}`}>
                                More <ChevronDown size={12} />
                            </button>
                            <div className="absolute top-full left-0 mt-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-xl py-4 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-[110]">
                                {moreCategoriesDynamic.map(item => (
                                    <Link
                                        key={item}
                                        href={`/news?category=${item}${currentCountry !== 'All' ? `&country=${currentCountry}` : ''}`}
                                        className={`block px-6 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-700 dark:hover:text-red-400 transition-colors font-bold text-[11px] uppercase tracking-widest ${currentCategory === item ? 'text-red-700 dark:text-red-400' : ''}`}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </li>

                        {/* Country Filter Dropdown (Last) */}
                        <li className="ml-2 border-l pl-4 border-slate-200 dark:border-slate-700 relative group/country">
                            <button className={`flex items-center gap-1 hover:text-red-700 dark:hover:text-red-400 transition-colors uppercase py-1 ${currentCountry !== 'All' ? 'text-red-700 dark:text-red-400 font-black' : ''}`}>
                                {currentCountry === 'All' ? 'Country' : currentCountry} <ChevronDown size={12} />
                            </button>
                            {/* Country Dropdown */}
                            <div className="absolute top-full right-0 mt-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-xl py-4 opacity-0 invisible group-hover/country:opacity-100 group-hover/country:visible transition-all z-[110]">
                                {countryList.map(country => (
                                    <Link
                                        key={country}
                                        href={`/news?country=${country}${currentCategory !== 'All' ? `&category=${currentCategory}` : ''}`}
                                        className="block px-6 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-700 dark:hover:text-red-400 transition-colors font-bold text-[11px] uppercase tracking-widest"
                                    >
                                        {country}
                                    </Link>
                                ))}
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
