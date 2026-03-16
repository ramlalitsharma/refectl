'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, BarChart3, Clock, Type, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export function WordCounterTool() {
    const [input, setInput] = useState('');

    const stats = useMemo(() => {
        const text = input.trim();
        if (!text) return { words: 0, chars: 0, charsNoSpaces: 0, lines: 0, readingTime: 0, speakingTime: 0 };

        const words = text.split(/\s+/).filter(Boolean).length;
        const chars = input.length;
        const charsNoSpaces = input.replace(/\s/g, '').length;
        const lines = input.split('\n').filter(Boolean).length;

        // Avg reading speed 225 wpm, speaking 150 wpm
        const readingTime = Math.ceil(words / 225);
        const speakingTime = Math.ceil(words / 150);

        return { words, chars, charsNoSpaces, lines, readingTime, speakingTime };
    }, [input]);

    const copyStats = async () => {
        const report = `
Text Analysis Report:
--------------------
Words: ${stats.words}
Characters: ${stats.chars}
Characters (no spaces): ${stats.charsNoSpaces}
Lines: ${stats.lines}
Estimated Reading Time: ${stats.readingTime} min
Estimated Speaking Time: ${stats.speakingTime} min
    `.trim();

        try {
            await navigator.clipboard.writeText(report);
            toast.success('Stats report copied!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Input Content</h3>
                    <Button variant="ghost" size="sm" onClick={() => setInput('')} title="Clear All" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                    </Button>
                </div>
                <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden transition-all focus-within:border-blue-500">
                    <textarea
                        className="w-full min-h-[400px] p-8 bg-transparent resize-none focus:outline-none text-xl font-medium leading-relaxed dark:text-slate-200"
                        placeholder="Start typing or paste your document here for instant professional analysis..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Words', value: stats.words, icon: Type, color: 'text-blue-500' },
                    { label: 'Characters', value: stats.chars, icon: Eye, color: 'text-purple-500' },
                    { label: 'Lines', value: stats.lines, icon: BarChart3, color: 'text-emerald-500' },
                    { label: 'No Spaces', value: stats.charsNoSpaces, icon: Hash, color: 'text-orange-500' },
                    { label: 'Reading', value: `${stats.readingTime}m`, icon: Clock, color: 'text-cyan-500' },
                    { label: 'Speaking', value: `${stats.speakingTime}m`, icon: MessageCircle, color: 'text-pink-500' },
                ].map((item, i) => (
                    <Card key={i} className="border-none bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-slate-100 dark:border-white/5">
                        <div className="space-y-4 text-center">
                            <div className={`mx-auto w-10 h-10 rounded-2xl bg-current/10 ${item.color} flex items-center justify-center`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{item.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    onClick={copyStats}
                    variant="outline"
                    className="h-14 px-10 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-bold hover:border-blue-500 hover:text-blue-500 transition-all gap-3"
                >
                    <Copy size={18} /> Copy full Analytics Report
                </Button>
            </div>

            <div className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <h4 className="text-3xl font-black tracking-tighter uppercase italic">Writing Productivity</h4>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Track your content depth in real-time. Whether you're writing an essay, a blog post, or a meta description, our analytics ensures you hit your target length perfectly.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest">SEO Ready</div>
                            <div className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest">Live Sync</div>
                        </div>
                    </div>
                    <div className="glass-card-premium p-8 rounded-[2rem] border-white/20 bg-white/5 backdrop-blur-3xl">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Content Insight</p>
                        <blockquote className="text-xl font-bold italic leading-relaxed text-blue-50">
                            "The difference between the almost right word and the right word is really a large matter—it’s the difference between the lightning bug and the lightning."
                        </blockquote>
                        <p className="mt-4 text-sm text-blue-200">— Mark Twain</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
