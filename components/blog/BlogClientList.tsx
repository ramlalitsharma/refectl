"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search, ArrowUpRight, BookOpen } from 'lucide-react';
import { InstitutionalAdUnit } from '../revenue/InstitutionalAdUnit';

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1510915228340-45c4f29df81c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
];

const BLOG_CATEGORIES = [
    { id: 'all', label: 'All Intelligence' },
    { id: 'education', label: 'Education & Learning' },
    { id: 'it', label: 'IT & AI Innovation' },
    { id: 'business', label: 'Business & Finance' },
    { id: 'industry', label: 'Industry & Trends' },
    { id: 'geopolitics', label: 'Geopolitical Analysis' },
];

function getFallbackImage(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
}

export function BlogClientList({ initialPosts }: { initialPosts: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [filteredPosts, setFilteredPosts] = useState(initialPosts);

    useEffect(() => {
        const results = initialPosts.filter(post => {
            const matchesSearch = 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = 
                activeCategory === 'all' || 
                post.category?.toLowerCase() === activeCategory ||
                post.tags?.some((tag: string) => tag.toLowerCase() === activeCategory);

            return matchesSearch && matchesCategory;
        });
        setTimeout(() => setFilteredPosts(results), 0);
    }, [searchTerm, activeCategory, initialPosts]);

    const featuredPost = filteredPosts[0];
    const secondary = filteredPosts.slice(1, 4);
    const others = filteredPosts.slice(4);

    return (
        <div className="min-h-screen bg-[#030407] text-slate-200 selection:bg-[#06b6d4]/30 font-sans">
            {/* Cinematic Intelligence Header */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(6,182,212,0.08),transparent_70%)]" />
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <span className="px-6 py-2 bg-[#06b6d4]/10 border border-[#06b6d4]/20 rounded-full text-[#06b6d4] text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
                                Deep Intelligence Hub
                            </span>
                            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                                Refectl <span className="text-[#06b6d4]">Insights</span>
                            </h1>
                        </div>
                        
                        <p className="text-gray-400 text-lg md:text-xl font-medium italic opacity-60 max-w-2xl mx-auto">
                            Institutional intelligence and deep-dive analysis from the Refectl research team, focusing on the intersection of technology, education, and global trends.
                        </p>

                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute inset-0 bg-[#06b6d4]/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-[#06b6d4] transition-colors" />
                            <input
                                type="text"
                                placeholder="Scan intelligence reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-16 pr-8 text-white text-lg focus:outline-none focus:border-[#06b6d4]/50 focus:bg-white/[0.08] transition-all backdrop-blur-xl"
                            />
                        </div>

                        {/* Category Filter Bar */}
                        <div className="flex flex-wrap justify-center gap-3 pt-8">
                            {BLOG_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                                        activeCategory === cat.id 
                                            ? 'bg-[#06b6d4] text-black border-[#06b6d4]' 
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-[#06b6d4]/30 hover:text-white'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="container mx-auto px-6 py-20">
                {!filteredPosts.length ? (
                    <div className="py-40 text-center space-y-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto animate-pulse">
                            <BookOpen size={40} className="text-gray-600" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Signal Lost - No Articles Found</h2>
                        <button onClick={() => setSearchTerm('')} className="text-[#06b6d4] text-xs font-black uppercase tracking-widest hover:underline">Reset Search Matrix</button>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* 12-Column Intelligence Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Primary Insight - 8 Columns */}
                            {featuredPost && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="lg:col-span-8 group cursor-pointer"
                                >
                                    <Link href={`/blog/${featuredPost.slug}`} className="block space-y-8">
                                        <div className="relative aspect-[21/9] overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900 group-hover:border-[#06b6d4]/50 transition-all duration-700">
                                            <img
                                                src={featuredPost.coverImage || getFallbackImage(featuredPost._id)}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-60"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-transparent to-transparent opacity-80" />
                                            <div className="absolute top-8 left-8">
                                                <span className="px-6 py-2 bg-[#06b6d4] text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl">
                                                    Featured Briefing
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-2">
                                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic group-hover:text-[#06b6d4] transition-colors leading-none">
                                                {featuredPost.title}
                                            </h2>
                                            <p className="text-gray-400 text-lg line-clamp-2 max-w-3xl font-medium leading-relaxed italic opacity-80">
                                                {featuredPost.excerpt}
                                            </p>
                                            <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(featuredPost.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-[#06b6d4] uppercase tracking-widest">
                                                    View Full Analysis <ArrowUpRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Lateral Insights - 4 Columns */}
                            <div className="lg:col-span-4 space-y-12">
                                <h3 className="text-[11px] font-black text-[#06b6d4] uppercase tracking-[0.5em] border-b border-white/5 pb-4">Latest Dispatches</h3>
                                <div className="space-y-10">
                                    {secondary.map((post: any, idx) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group"
                                        >
                                            <Link href={`/blog/${post.slug}`} className="flex gap-6 items-center">
                                                <div className="w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border border-white/5 bg-slate-900 group-hover:border-[#06b6d4]/30 transition-colors">
                                                    <img
                                                        src={post.coverImage || getFallbackImage(post._id)}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2 italic">
                                                        {post.title}
                                                    </h4>
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">RELAYED {new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* Sponsored Insight Slot */}
                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#06b6d4]/10 to-transparent border border-[#06b6d4]/20 relative overflow-hidden group cursor-pointer">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ArrowUpRight size={80} />
                                    </div>
                                    <span className="text-[8px] font-black text-[#06b6d4] uppercase tracking-[0.4em] mb-4 block">Institutional Access</span>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
                                        Unlock Premium Intelligence Terminals
                                    </h4>
                                    <button className="text-[#06b6d4] text-[10px] font-black uppercase tracking-[0.3em]">Learn More →</button>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Bento Grid */}
                        <div className="space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] whitespace-nowrap">Archives of Intelligence</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {others.map((post: any, idx) => (
                                    <motion.div
                                        key={post._id}
                                        whileHover={{ y: -10 }}
                                        className="group"
                                    >
                                        <Link href={`/blog/${post.slug}`} className="block space-y-6 bg-white/[0.02] border border-white/5 p-4 rounded-[2.5rem] hover:bg-white/[0.04] transition-all duration-500 hover:border-[#06b6d4]/30">
                                            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/5">
                                                <img
                                                    src={post.coverImage || getFallbackImage(post._id)}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                            </div>
                                            <div className="px-2 space-y-4">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2 italic">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2 italic">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    <ArrowRight size={14} className="text-gray-600 group-hover:text-[#06b6d4] transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Strategic Ad Slot */}
                            <div className="mt-12">
                                <InstitutionalAdUnit slot="blog-feed-mid" format="fluid" />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
