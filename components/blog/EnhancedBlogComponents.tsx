'use client';

import { useEffect, useState } from 'react';
import { ProgressBar, PulsingDot } from '@/components/ui/AdvancedEffects';

interface ReadingProgressProps {
    className?: string;
}

export function ReadingProgress({ className = '' }: ReadingProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            setProgress(progress);
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress();

        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
            <div
                className="h-1 bg-gradient-to-r from-elite-accent-cyan to-elite-accent-purple transition-all duration-150"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

interface TableOfContentsProps {
    headings: { id: string; text: string; level: number }[];
    className?: string;
}

export function TableOfContents({ headings, className = '' }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -80% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className={`sticky top-24 ${className}`}>
            <div className="glass-card-premium p-6 rounded-2xl border-white/10">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                    Table of Contents
                </h3>
                <ul className="space-y-2">
                    {headings.map(({ id, text, level }) => (
                        <li key={id} style={{ paddingLeft: `${(level - 1) * 12}px` }}>
                            <a
                                href={`#${id}`}
                                className={`block py-1 text-sm transition-colors ${activeId === id
                                        ? 'text-elite-accent-cyan font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

interface ShareButtonsProps {
    url: string;
    title: string;
    className?: string;
}

export function ShareButtons({ url, title, className = '' }: ShareButtonsProps) {
    const shareLinks = [
        {
            name: 'Twitter',
            icon: '𝕏',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            color: 'hover:bg-black hover:text-white',
        },
        {
            name: 'LinkedIn',
            icon: 'in',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'hover:bg-blue-600 hover:text-white',
        },
        {
            name: 'Facebook',
            icon: 'f',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'hover:bg-blue-500 hover:text-white',
        },
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        // Could trigger a toast here
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Share:</span>
            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold transition-all btn-lift ${link.color}`}
                    aria-label={`Share on ${link.name}`}
                >
                    {link.icon}
                </a>
            ))}
            <button
                onClick={copyToClipboard}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all btn-lift hover:bg-elite-accent-cyan hover:text-white"
                aria-label="Copy link"
            >
                🔗
            </button>
        </div>
    );
}

interface ReadingTimeProps {
    minutes: number;
    className?: string;
}

export function ReadingTime({ minutes, className = '' }: ReadingTimeProps) {
    return (
        <div className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 ${className}`}>
            <span>📖</span>
            <span>{minutes} min read</span>
        </div>
    );
}

interface AuthorCardProps {
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
    className?: string;
}

export function AuthorCard({ name, avatar, bio, role, className = '' }: AuthorCardProps) {
    return (
        <div className={`glass-card-premium p-6 rounded-2xl border-white/10 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple flex items-center justify-center text-white text-2xl font-black shrink-0">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{name}</h3>
                    {role && (
                        <p className="text-sm text-elite-accent-cyan font-semibold">{role}</p>
                    )}
                    {bio && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{bio}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface RelatedArticlesProps {
    articles: { slug: string; title: string; excerpt?: string; coverImage?: string }[];
    className?: string;
}

export function RelatedArticles({ articles, className = '' }: RelatedArticlesProps) {
    if (articles.length === 0) return null;

    return (
        <div className={className}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                Related Articles
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <a
                        key={article.slug}
                        href={`/blog/${article.slug}`}
                        className="group block card-hover-lift bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {article.coverImage && (
                            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-elite-accent-cyan transition-colors line-clamp-2">
                                {article.title}
                            </h4>
                            {article.excerpt && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                    {article.excerpt}
                                </p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
