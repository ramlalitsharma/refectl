'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bot, Video, GraduationCap, PenTool, BarChart3, Users, ShoppingBag, Workflow } from 'lucide-react';

type FeatureTone = 'light' | 'dark';

type Feature = {
    title: string;
    description: string;
    icon: React.ReactNode;
    className: string;
    image?: string;
    tone?: FeatureTone;
    cta?: string;
};

const features: Feature[] = [
    {
        title: 'AI Utilities Hub',
        description: '500+ tools across PDF, AI, developer, SEO, generators, converters, and calculators built for instant results.',
        icon: <Bot className="h-9 w-9" />,
        className: 'md:col-span-2 md:row-span-2 bg-slate-900 text-white p-8',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
        tone: 'dark',
    },
    {
        title: 'Learning Academy',
        description: 'Video and text courses, guided learning paths, study plans, and quizzes that adapt to your goals.',
        icon: <GraduationCap className="h-9 w-9" />,
        className: 'md:col-span-2 bg-white p-6 border border-slate-200',
        tone: 'light',
    },
    {
        title: 'Live Classes & Rooms',
        description: 'Host or join interactive sessions, with recordings and replays available after every event.',
        icon: <Video className="h-9 w-9" />,
        className: 'md:col-span-1 bg-blue-600 text-white p-6',
        tone: 'dark',
    },
    {
        title: 'Creator Studio',
        description: 'Publish courses, lessons, blogs, and ebooks with a centralized studio and workflow.',
        icon: <PenTool className="h-9 w-9" />,
        className: 'md:col-span-1 bg-emerald-600 text-white p-6',
        tone: 'dark',
    },
    {
        title: 'Analytics & Progress',
        description: 'Track enrollments, completions, engagement, and growth with built-in analytics dashboards.',
        icon: <BarChart3 className="h-9 w-9" />,
        className: 'md:col-span-2 bg-slate-900 text-white p-6',
        tone: 'dark',
    },
    {
        title: 'Community & Forums',
        description: 'Discuss courses, careers, exams, and tools with peers across the Refectl ecosystem.',
        icon: <Users className="h-9 w-9" />,
        className: 'md:col-span-1 bg-white p-6 border border-slate-200',
        tone: 'light',
    },
    {
        title: 'Forge Shop',
        description: 'Premium toolkits, bundles, and creator assets for power users and teams.',
        icon: <ShoppingBag className="h-9 w-9" />,
        className: 'md:col-span-1 bg-amber-500 text-white p-6',
        tone: 'dark',
    },
    {
        title: 'Future-Ready Roadmap',
        description: 'New tool families, deeper integrations, and advanced workflows are in active development.',
        icon: <Workflow className="h-9 w-9" />,
        className: 'md:col-span-4 bg-indigo-900 text-white p-6',
        tone: 'dark',
        cta: 'Coming Soon',
    },
];

export function BentoFeatures() {
    return (
        <div className="py-24 bg-[#f8fafc]">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                    >
                        Platform <span className="text-blue-600">Overview</span>
                    </motion.h2>
                    <p className="text-lg text-slate-600">
                        Refectl is no longer just courses. It is a unified hub of AI utilities, learning systems, creator tooling, analytics, and community with more capabilities shipping next.
                    </p>
                </div>

                <div className="bento-grid max-w-6xl mx-auto">
                    {features.map((feature, idx) => {
                        const tone = feature.tone ?? 'dark';
                        const toneStyles = tone === 'light'
                            ? {
                                icon: 'text-slate-900',
                                title: 'text-slate-900',
                                description: 'text-slate-600',
                                footer: 'text-slate-400',
                            }
                            : {
                                icon: 'text-white/90',
                                title: 'text-white',
                                description: 'text-blue-50/90',
                                footer: 'text-white/70',
                            };

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`bento-item flex flex-col justify-between group cursor-pointer ${feature.className}`}
                            >
                                {feature.image && (
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                )}
                                <div className="relative z-10">
                                    <div className={`mb-4 ${toneStyles.icon}`}>{feature.icon}</div>
                                    <h3 className={`text-2xl font-bold mb-2 ${toneStyles.title}`}>{feature.title}</h3>
                                    <p className={toneStyles.description}>
                                        {feature.description}
                                    </p>
                                </div>
                                <div className="relative z-10 mt-8">
                                    <span className={`text-sm font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity ${toneStyles.footer}`}>
                                        {feature.cta ?? 'Platform Capability'}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
