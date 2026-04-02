'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { 
    Globe, 
    Zap, 
    Target, 
    ArrowRight, 
    Loader2, 
    AlertCircle,
    TrendingUp,
    Languages,
    Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface BusinessInsight {
    region: string;
    problem: string;
    solution: string;
    impactScore: number;
    recommendedActions: string[];
    language: string;
}

interface LanguagePerformance {
    locale: string;
    engagementScore: number;
    contentVolume: number;
    growthTrend: 'increasing' | 'stable' | 'decreasing';
}

export default function InsightsPage() {
    const [insights, setInsights] = useState<BusinessInsight[]>([]);
    const [performance, setPerformance] = useState<LanguagePerformance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/insights/analyze');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setPerformance(data);
        } catch (error) {
            toast.error('Failed to load performance metrics');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/admin/insights/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 40 })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setInsights(data.insights);
            toast.success('Global analysis complete');
        } catch (error: any) {
            toast.error(error.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 p-8 sm:p-12 space-y-12">
            {/* Header */}
            <section className="relative">
                <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Neural Intelligence</h3>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                    Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Global Insights</span>
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-4 max-w-xl">
                    Aggregating worldwide market signals, regional hurdles, and AI-driven business solutions for global expansion.
                </p>
            </section>

            {/* Performance Stats */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {performance.slice(0, 4).map((p) => (
                    <StatCard
                        key={p.locale}
                        title={`${p.locale.toUpperCase()} Engagement`}
                        value={p.engagementScore.toString()}
                        subtitle={`${p.contentVolume} Content Units`}
                        icon={<Languages className="w-5 h-5 text-cyan-400" />}
                        trend={p.growthTrend === 'increasing' ? 'Optimal' : 'Stable'}
                    />
                ))}
            </section>

            {/* Signal Distribution Visualizer */}
            <section className="glass-card-premium rounded-[3rem] border border-white/5 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Cognitive Distribution Map</h3>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                            Worldwide <br />Problem Density
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto md:mx-0 leading-relaxed">
                            A neural visualization of identified market gaps and educational hurdles detected by the AI relay.
                        </p>
                    </div>
                    
                    <div className="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                        {['North America', 'India', 'Europe', 'East Asia', 'Middle East', 'Latin America'].map((region) => {
                            const hasInsight = insights.some(i => i.region.includes(region));
                            return (
                                <div key={region} className={`p-6 rounded-2xl border transition-all duration-700 ${
                                    hasInsight 
                                    ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)]' 
                                    : 'bg-white/5 border-white/5 opacity-40'
                                }`}>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${hasInsight ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${hasInsight ? 'text-white' : 'text-slate-500'}`}>
                                            {region}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card-premium rounded-[2rem] border border-white/5 p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Analysis Control</h3>
                        
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Trigger a deep-scan of worldwide news and user activity to generate new business opportunities.
                            </p>
                            <Button 
                                onClick={triggerAnalysis} 
                                disabled={isAnalyzing}
                                className="w-full h-14 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20"
                            >
                                {isAnalyzing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Zap className="w-4 h-4 mr-2" /> Start Global Analysis</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="glass-card-premium rounded-[2rem] border border-white/5 p-8 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Regional Performance</h3>
                        <div className="space-y-3">
                            {performance.map((p) => (
                                <div key={p.locale} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{p.locale}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-500" 
                                                style={{ width: `${Math.min(p.engagementScore / 10, 100)}%` }} 
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{p.engagementScore}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Insight Results */}
                <div className="lg:col-span-2 space-y-6">
                    {insights.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-4 glass-card-premium rounded-[3rem] border border-white/5 border-dashed">
                            <Target className="w-12 h-12 text-slate-700 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Waitng for Neural Scan...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative group hover:border-cyan-500/30 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                                            Impact: {insight.impactScore}%
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{insight.region} • {insight.language}</h4>
                                                <h3 className="text-xl font-bold text-white leading-tight underline decoration-cyan-500/30 underline-offset-4">{insight.problem}</h3>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <h5 className="flex items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        <Lightbulb className="w-3 h-3 mr-2" /> Suggested Solution
                                                    </h5>
                                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                        {insight.solution}
                                                    </p>
                                                </div>
                                                <div className="space-y-3">
                                                    <h5 className="flex items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        <TrendingUp className="w-3 h-3 mr-2" /> Strategic Actions
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {insight.recommendedActions.map((action, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                                <ArrowRight className="w-3 h-3 mt-0.5 text-cyan-500" />
                                                                {action}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
