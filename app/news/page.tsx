'use client';

import { FadeIn } from '@/components/ui/Motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const newsItems = [
    {
        id: '1',
        title: 'Adaptive Learning Platform v2.0 Launched',
        date: 'Jan 12, 2026',
        category: 'Product Update',
        summary: 'We are thrilled to announce the launch of our most advanced update yet, featuring real-time AI personalization and 4K live streaming integration.',
        href: '#',
    },
    {
        id: '2',
        title: 'Global Partnership with Leading Education Tech',
        date: 'Jan 10, 2026',
        category: 'Partnership',
        summary: 'Our platform is now integrated with major educational resources, providing students with a wider choice of high-quality courses and certification paths.',
        href: '#',
    },
    {
        id: '3',
        title: 'New Featured Courses: Generative AI and Robotics',
        date: 'Jan 8, 2026',
        category: 'Course News',
        summary: 'Dive into the world of tomorrow with our new specialized tracks in AI development and robotics, led by industry experts.',
        href: '#',
    },
];

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <FadeIn>
                    <div className="mb-12">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            What's New
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                            Latest News & <span className="text-blue-600">Company Updates</span>
                        </h1>
                        <p className="text-slate-500 mt-4 text-lg">
                            Stay up to date with the latest features, partnerships, and announcements from the platform.
                        </p>
                    </div>
                </FadeIn>

                <div className="space-y-6">
                    {newsItems.map((item, idx) => (
                        <FadeIn key={item.id} delay={idx * 0.1}>
                            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white group">
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs font-bold border-slate-200">
                                                {item.category}
                                            </Badge>
                                            <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                                        <Link href={item.href}>{item.title}</Link>
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {item.summary}
                                    </p>
                                    <Link href={item.href} className="text-blue-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Read Full Story <span>→</span>
                                    </Link>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    ))}
                </div>

                <div className="mt-16 bg-slate-900 rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to our newsletter</h3>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                            Get the latest news and updates delivered directly to your inbox every week.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
