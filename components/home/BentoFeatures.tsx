'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bot, Video, ClipboardCheck, Globe2 } from 'lucide-react';

const features = [
    {
        title: 'AI Personalization',
        description: 'Our AI engine adapts to your learning pace, identifying gaps before you even notice them.',
        icon: <Bot className="h-9 w-9" />,
        className: 'md:col-span-2 md:row-span-2 bg-vibrant-gradient text-white p-8',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    },
    {
        title: 'Live 4K Classes',
        description: 'Join real-time interactive classrooms with 4K video and low latency.',
        icon: <Video className="h-9 w-9" />,
        className: 'md:col-span-2 bg-white p-6 border border-slate-200',
    },
    {
        title: 'Adaptive Quizzes',
        description: 'Tests that evolve with your performance to master any subject.',
        icon: <ClipboardCheck className="h-9 w-9" />,
        className: 'md:col-span-1 bg-slate-900 text-white p-6',
    },
    {
        title: 'Global Community',
        description: 'Learn with peers from over 120 countries.',
        icon: <Globe2 className="h-9 w-9" />,
        className: 'md:col-span-1 bg-aurora-gradient text-white p-6',
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
                        Engineered for <span className="text-blue-600">World-Class</span> Learning
                    </motion.h2>
                    <p className="text-lg text-slate-600">
                        We combined cutting-edge AI with premium interactive tools to create the most advanced learning environment on the web.
                    </p>
                </div>

                <div className="bento-grid max-w-6xl mx-auto">
                    {features.map((feature, idx) => (
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
                                <div className="mb-4 text-white/90">{feature.icon}</div>
                                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                                <p className={feature.className.includes('bg-white') ? 'text-slate-600' : 'text-blue-50 opacity-90'}>
                                    {feature.description}
                                </p>
                            </div>
                            <div className="relative z-10 mt-8">
                                <span className="text-sm font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                    Explore Feature →
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
