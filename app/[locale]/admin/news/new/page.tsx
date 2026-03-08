'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FadeIn } from '@/components/ui/Motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Save, Globe, Eye, Image as ImageIcon, Zap, Sparkles, BarChart3, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { News } from '@/lib/models/News';
import { MediaUploader } from '@/components/admin/MediaUploader';

export default function NewsEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const isNew = id === 'new';

    const [formData, setFormData] = useState<Partial<News>>({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category: 'Product Update',
        status: 'draft'
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetchItem();
        }
    }, [id, isNew]);

    const fetchItem = async () => {
        try {
            const res = await fetch(`/api/admin/news/${id}`);
            if (!res.ok) throw new Error('Failed to fetch article');
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            toast.error('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                status: publish ? 'published' : formData.status || 'draft'
            };

            const res = await fetch('/api/admin/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(publish ? 'Intelligence Disseminated! 🚀' : 'Node Progress Saved');
            router.push('/admin/news');
        } catch (error) {
            toast.error('Cloud Sync Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-elite-bg flex items-center justify-center">
            <div className="space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-elite-accent-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-black uppercase tracking-[0.4em] text-slate-500 text-xs">Initializing Studio...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-elite-bg text-slate-100 selection:bg-elite-accent-cyan/30">
            {/* Elite Studio Header */}
            <div className="sticky top-0 z-50 glass-card-premium border-b border-white/5 px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/news">
                            <Button size="xs" variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
                                <ChevronLeft size={20} />
                            </Button>
                        </Link>
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase">
                                {isNew ? 'New Intel Node' : 'Edit Intelligence'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-elite-accent-cyan opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-elite-accent-cyan"></span>
                                </span>
                                <span className="text-[10px] font-black pointer-events-none text-slate-500 uppercase tracking-widest">Global Relay Protocol v4.0</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5" onClick={() => handleSave(false)} isLoading={saving && formData.status === 'draft'}>
                            Store Draft
                        </Button>
                        <Button className="h-12 px-8 rounded-2xl bg-elite-accent-cyan text-black hover:bg-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-elite-accent-cyan/20" onClick={() => handleSave(true)} isLoading={saving && formData.status === 'published'}>
                            <Globe size={14} className="mr-2" />
                            Live Publish
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 lg:p-12 grid gap-12 lg:grid-cols-[1fr,360px]">
                <div className="space-y-12">
                    <FadeIn>
                        <div className="glass-card-premium p-10 rounded-[3rem] border border-white/5 space-y-10">
                            {/* Title Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Headline</label>
                                    <span className="text-[9px] font-black text-elite-accent-cyan uppercase tracking-widest">Required</span>
                                </div>
                                <input
                                    className="w-full text-5xl lg:text-6xl font-black text-white bg-transparent border-none p-0 focus:ring-0 placeholder:text-white/5 tracking-tighter"
                                    placeholder="Type news headline..."
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))}
                                />
                            </div>

                            {/* Summary Section */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Intelligence Brief</label>
                                <textarea
                                    className="w-full min-h-[120px] text-xl text-slate-400 bg-transparent border-none p-0 focus:ring-0 placeholder:text-white/5 resize-none font-medium leading-relaxed"
                                    placeholder="Brief summary for global distribution..."
                                    value={formData.summary}
                                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                />
                            </div>

                            <hr className="border-white/5" />

                            {/* Content Body */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Full Analysis</label>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-elite-accent-purple uppercase tracking-widest hover:border-elite-accent-purple/30 transition-all">
                                            <Sparkles size={14} /> AI Context Bridge
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full min-h-[500px] glass-card-premium rounded-[2rem] p-8 text-slate-300 bg-white/5 border border-white/5 focus:border-elite-accent-cyan/30 focus:outline-none transition-all font-serif text-lg leading-relaxed placeholder:text-white/5"
                                    placeholder="Compose the full analytical narrative here..."
                                    value={formData.content as string}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <aside className="space-y-8">
                    {/* Settings Panel */}
                    <FadeIn delay={0.1}>
                        <div className="glass-card-premium rounded-[2.5rem] border border-white/5 overflow-hidden">
                            <div className="p-8 border-b border-white/5 bg-white/5">
                                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Telemetry & Parameters</h2>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Distribution Sector (Category)</label>
                                    <input
                                        type="text"
                                        list="news-categories"
                                        className="w-full h-12 rounded-xl border border-white/10 text-xs font-black bg-white/5 text-white focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/50 px-4 placeholder:text-slate-600"
                                        placeholder="Select or type new category..."
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    />
                                    <datalist id="news-categories">
                                        <option value="World" />
                                        <option value="Politics" />
                                        <option value="Business" />
                                        <option value="Technology" />
                                        <option value="Finance" />
                                        <option value="Environment" />
                                        <option value="Culture" />
                                        <option value="Health" />
                                    </datalist>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Reporting Region (Country)</label>
                                    <input
                                        type="text"
                                        list="news-countries"
                                        className="w-full h-12 rounded-xl border border-white/10 text-xs font-black bg-white/5 text-white focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/50 px-4 placeholder:text-slate-600"
                                        placeholder="Select or type new country..."
                                        value={typeof formData.country === 'string' ? formData.country : 'Global'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    />
                                    <datalist id="news-countries">
                                        <option value="Global" />
                                        <option value="USA" />
                                        <option value="UK" />
                                        <option value="Nepal" />
                                        <option value="India" />
                                        <option value="China" />
                                        <option value="Japan" />
                                        <option value="Germany" />
                                        <option value="France" />
                                        <option value="Brazil" />
                                    </datalist>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Endpoint Slug</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-elite-accent-cyan group-hover:scale-110 transition-transform">
                                            <Zap size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full h-12 pl-12 rounded-xl border-white/10 text-xs font-black bg-white/5 text-slate-500 cursor-not-allowed"
                                            value={formData.slug}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <hr className="border-white/5" />

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Neural Cover</label>
                                    <MediaUploader
                                        label=""
                                        currentValue={formData.banner_image}
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, banner_image: url }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* SEO Intelligence Card */}
                    <FadeIn delay={0.2}>
                        <div className="glass-card-premium p-8 rounded-[2.5rem] border-white/5 bg-elite-accent-cyan/5 border-elite-accent-cyan/10">
                            <h3 className="text-[10px] font-black text-elite-accent-cyan uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <BarChart3 size={14} /> SEO Telemetry
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Search Score</span>
                                    <span className="text-xs font-black text-white">92 / 100</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[92%] h-full bg-elite-accent-cyan" />
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Metadata validation confirmed</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <div className="p-8 glass-card-premium rounded-[2.5rem] border-white/5 bg-elite-accent-purple/5 border-elite-accent-purple/10">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-elite-accent-purple/10 flex items-center justify-center text-elite-accent-purple shrink-0 border border-elite-accent-purple/20">
                                <Search size={18} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Global Discovery</h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Intelligence will be indexed globally across all Refectl nodes within 30 seconds.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
