"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, CheckCircle } from 'lucide-react';
import NextLink from 'next/link';
import { SocialShare } from '@/components/ui/SocialShare';
import { BRAND_URL } from '@/lib/brand';
import { BlogComments } from '@/components/blog/BlogComments';
import { InstitutionalAdUnit } from '@/components/revenue/InstitutionalAdUnit';

const MarkdownPreview = dynamic(
    () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
    { ssr: false }
);

export function BlogPostClient({ post, slug, content }: { post: any, slug: string, content: string }) {
    const [activeId, setActiveId] = React.useState<string>('');
    const toc = React.useMemo(() => {
        const matches = content.match(/^##\s+(.*)$/gm) || [];
        return matches.map(match => {
            const text = match.slice(3).trim();
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return { id, text };
        });
    }, [content]);

    // Dynamic Reading Time
    const readingTime = React.useMemo(() => {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }, [content]);

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '-10% 0px -80% 0px' });

        document.querySelectorAll('h2').forEach((h) => observer.observe(h));
        return () => observer.disconnect();
    }, [content]);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const imageUrl = post.coverImage || post.metadata?.heroImage;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-[#06b6d4] z-[100] origin-left"
                style={{ scaleX }}
            />

            <header className="relative w-full h-[70vh] flex items-end justify-start overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {imageUrl && <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                </motion.div>

                <div className="container mx-auto px-4 pb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="max-w-4xl space-y-6"
                    >
                        <NextLink
                            href="/blog"
                            className="inline-flex items-center gap-2 text-[#06b6d4] font-black text-[10px] uppercase tracking-[0.4em] pb-4 hover:gap-4 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Intelligence Hub
                        </NextLink>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                <Clock className="w-4 h-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
                                {post.title}
                            </h1>
                            <div className="hidden md:block shrink-0">
                                <SocialShare
                                    url={`${BRAND_URL}/blog/${slug}`}
                                    title={post.title}
                                    contentType="blog"
                                    contentId={slug}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-20 relative z-20">
                <div className="grid lg:grid-cols-[250px,1fr] gap-16">
                    {/* Sticky Sidebar ToC */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                                    Table of Contents
                                </h3>
                                <nav className="flex flex-col gap-3">
                                    {toc.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                                            className={`text-[11px] font-black uppercase tracking-wider text-left transition-all duration-300 border-l-2 pl-4 py-1 hover:text-white ${activeId === item.id ? 'border-[#06b6d4] text-white translate-x-1' : 'border-white/5 text-gray-500 hover:border-white/10'}`}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="pt-8 border-t border-slate-800 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                                        Share Insight
                                    </h3>
                                    <SocialShare
                                        url={`${BRAND_URL}/blog/${slug}`}
                                        title={post.title}
                                        contentType="blog"
                                        contentId={slug}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="max-w-4xl w-full"
                    >
                        <article className="prose prose-invert prose-indigo prose-lg md:prose-xl max-w-none remark-markdown bg-transparent">
                            <div className="my-12">
                                <InstitutionalAdUnit slot="blog-post-top" format="rectangle" />
                            </div>

                            <MarkdownPreview
                                source={content}
                                wrapperElement={{ "data-color-mode": "dark" }}
                                style={{ backgroundColor: 'transparent', fontSize: 'inherit', color: 'inherit' }}
                            />

                            <div className="my-12">
                                <InstitutionalAdUnit slot="blog-post-bottom" format="auto" />
                            </div>
                        </article>

                        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center gap-8 bg-white/[0.02] p-10 rounded-[3rem] border border-white/5">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#06b6d4] to-blue-600 flex items-center justify-center text-white text-3xl font-black italic">
                                {post.authorId?.slice(0, 1) || 'T'}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Refectl Institutional Desk</h4>
                                    <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                                </div>
                                <p className="text-gray-400 font-medium italic">
                                    This insight was authored and vetted by the Refectl Institutional Desk team to ensure high-fidelity analysis and academic rigor.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center md:justify-start">
                            <SocialShare
                                url={`${BRAND_URL}/blog/${slug}`}
                                title={post.title}
                                contentType="blog"
                                contentId={slug}
                            />
                        </div>

                        <BlogComments blogSlug={slug} />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
