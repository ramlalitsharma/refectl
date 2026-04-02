'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { NetworkPulseSidebar } from '@/components/news/NetworkPulseSidebar';
import { 
  Activity, 
  ArrowUpRight, 
  BarChart3, 
  Bot, 
  CalendarClock, 
  ChevronRight, 
  Globe, 
  Info, 
  Layers, 
  LayoutGrid, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StrategicSignalSidebar } from '@/components/news/StrategicSignalSidebar';
import { IPLStreamSidebar } from '@/components/news/IPLStreamSidebar';
import { Trophy } from 'lucide-react';

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  content?: string;
  summary?: string;
  category?: string;
  country?: string;
  author_id?: string;
  published_at?: string;
  created_at?: string;
  image_url?: string;
  image_alt?: string;
  view_count?: number;
  tags?: string[];
  impact_score?: number;
  sentiment?: string;
  author_name?: string;
  author_avatar?: string;
  source_name?: string;
  source_url?: string;
};

interface NewsFeedClientProps {
  initialItems: NewsItem[];
  initialTrending: NewsItem[];
  initialEvents?: any[];
  category: string;
  country: string;
  availableCountries?: string[];
  availableCategories?: string[];
  automationStatus?: any;
  networkAnalytics?: {
    totalReads: number;
    activeTerminals: number;
    scannedNodes: number;
    networkPulse: string;
    ingressRate: string;
  };
}

export default function NewsFeedClient({ 
  initialItems, 
  initialTrending,
  initialEvents = [],
  category,
  country,
  availableCountries = [],
  availableCategories = [],
  automationStatus,
  networkAnalytics
}: NewsFeedClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState(category);
  const [activeRegion, setActiveRegion] = useState(country);

  const items = useMemo(() => {
    const base = initialItems || [];
    if (activeFilter === 'IPL-Live') {
      return base.filter(item => 
        (item.category || '').toLowerCase() === 'sports' || 
        (item.tags || []).some(t => t.toLowerCase().includes('ipl') || t.toLowerCase().includes('cricket'))
      );
    }
    return base;
  }, [initialItems, activeFilter]);

  const trending = useMemo(() => initialTrending || [], [initialTrending]);

  const lead = items[0];
  const secondary = items.slice(1, 4);
  const others = items.slice(4);

  // Helper to check for trust tags
  const getIntegrityStatus = (tags: string[] = []) => {
    if (tags.some(t => t.includes('integrity_failure'))) return 'failed';
    if (tags.includes('multi_source_verified')) return 'verified';
    if (tags.includes('source_trusted')) return 'trusted';
    return 'neutral';
  };

  const handleFilterChange = (newCat: string) => {
    setActiveFilter(newCat);
    const params = new URLSearchParams();
    if (newCat !== 'All') params.set('category', newCat);
    if (activeRegion !== 'All' && activeRegion !== 'Global') params.set('country', activeRegion);
    router.push(`/news?${params.toString()}`);
  };

  // Phase 41: World-Class Visuals - Context-Aware Fallbacks
  const getFallbackImage = (category?: string, id?: string) => {
    const cat = (category || 'General').toLowerCase();
    const seed = id ? id.slice(-1) : '0';
    
    const fallbacks: Record<string, string[]> = {
      technology: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070'
      ],
      finance: [
        'https://images.unsplash.com/photo-1611974714024-462cd40c6c80?q=80&w=2070',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070'
      ],
      politics: [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2070',
        'https://images.unsplash.com/photo-1541872703-74c5e443d1fe?q=80&w=2070'
      ],
      world: [
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2070',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070'
      ],
      general: [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070',
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2070'
      ]
    };

    const options = fallbacks[cat] || fallbacks.general;
    const index = parseInt(seed, 16) || 0;
    return options[index % options.length];
  };

  // Phase 41: Dynamic Sentiment Engine
  const sentimentStats = useMemo(() => {
    const avgImpact = items.length > 0
      ? items.reduce((acc, curr) => acc + (curr.impact_score || 50), 0) / items.length
      : 52;
    
    let label = 'Neutral';
    let color = 'text-white';
    if (avgImpact > 75) { label = 'Volatile'; color = 'text-rose-500'; }
    else if (avgImpact > 65) { label = 'Active'; color = 'text-amber-500'; }
    else if (avgImpact < 35) { label = 'Stable'; color = 'text-emerald-500'; }

    return { score: Math.round(avgImpact), label, color };
  }, [items]);

  const handleRegionChange = (newReg: string) => {
    setActiveRegion(newReg);
    const params = new URLSearchParams();
    if (activeFilter !== 'All') params.set('category', activeFilter);
    if (newReg !== 'All' && newReg !== 'Global') params.set('country', newReg);
    router.push(`/news?${params.toString()}`);
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Bot className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-xl font-medium text-slate-200">No Intelligence Streams Found</h3>
        <p className="mt-2 text-sm">Adjust your filters or standby for live updates.</p>
        <button 
          onClick={() => { setActiveFilter('All'); setActiveRegion('All'); router.push('/news'); }}
          className="mt-6 px-6 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-full text-sm font-medium transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="news-layout-grid grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Primary Content Column */}
      <section className="news-primary-col lg:col-span-8 space-y-12">
        
        {/* LIVE IPL STREAM TOP CONTAINER */}
        {activeFilter === 'IPL-Live' && (
          <div className="glass-card-premium rounded-[2.5rem] overflow-hidden border-orange-500/20 shadow-[0_40px_100px_-15px_rgba(249,115,22,0.2)] animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="px-8 py-5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Trophy className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-white font-black uppercase tracking-[0.2em] text-sm">Live Decrypted Relay: IPL 2024</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Signal Locked • 1080p Crystal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white px-3 py-1 bg-white/10 rounded-full border border-white/20 uppercase tracking-widest">
                  Sports Intelligence
                </span>
              </div>
            </div>
            
            <div className="relative aspect-video bg-black">
              <iframe 
                src="https://embed.crichd.tech/embed.php?id=ss1" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            
            <div className="px-8 py-6 bg-slate-950/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between">
              <p className="text-slate-400 text-xs font-medium max-w-2xl leading-relaxed italic">
                You are viewing a high-priority tactical relay. Sports telemetry and analysis are being aggregated below.
              </p>
              <button 
                onClick={() => window.open('https://embed.crichd.tech/embed.php?id=ss1', '_blank')}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                External Hub
              </button>
            </div>
          </div>
        )}
        
        {/* Lead Story: Refactored to avoid nested <a> tags */}
        {lead && (
          <div 
            className="group relative cursor-pointer"
            onClick={() => router.push(`/news/${lead.slug}`)}
          >
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
              <img 
                src={lead.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072'} 
                alt={lead.image_alt || lead.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded">
                    {lead.category || 'Global Intel'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {lead.published_at ? format(new Date(lead.published_at), 'MMM dd, HH:mm') : 'Live Now'}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl group-hover:text-indigo-300 transition-colors">
                  {lead.title}
                </h1>
                
                <p className="text-slate-300 text-lg line-clamp-2 max-w-3xl mb-8 leading-relaxed">
                  {lead.summary || lead.content?.slice(0, 180)}...
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs">
                      {lead.author_name?.[0] || 'T'}
                    </div>
                    {lead.author_name || 'Terai Times Analyst'}
                  </div>
                  
                  {lead.source_name && (
                    <span 
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (lead.source_url) window.open(lead.source_url, '_blank');
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 text-sm transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Source: {lead.source_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lead Meta Indicators */}
            <div className="absolute top-8 right-8 flex flex-col gap-3">
              {lead.impact_score && (
                <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span className="text-white text-sm font-bold">Impact: {lead.impact_score}/100</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secondary Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondary.map((item) => (
            <div 
              key={item.id} 
              className="group cursor-pointer bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden hover:bg-slate-900/60 transition-all duration-300 hover:border-indigo-500/30 flex flex-col"
              onClick={() => router.push(`/news/${item.slug}`)}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={item.image_url || getFallbackImage(item.category, item.id)} 
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur text-indigo-400 text-[10px] font-bold uppercase rounded border border-white/10">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-100 mb-3 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-grow">
                  {item.summary || item.content?.slice(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    {item.published_at ? format(new Date(item.published_at), 'MMM dd') : 'Today'}
                  </span>
                  {item.impact_score && (
                    <span className="flex items-center gap-1 text-rose-400">
                      <Target className="w-3 h-3" />
                      API: {item.impact_score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Latest Feed Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-400" />
              Intelligence Relay
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {others.map((item) => (
              <div 
                key={item.id}
                className="group cursor-pointer flex gap-6 p-4 rounded-xl border border-white/0 hover:border-white/10 hover:bg-white/5 transition-all duration-300"
                onClick={() => router.push(`/news/${item.slug}`)}
              >
                <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                  <img 
                  src={item.image_url || getFallbackImage(item.category, item.id)} 
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                </div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                      {item.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {item.published_at ? format(new Date(item.published_at), 'MMM dd, HH:mm') : 'Just now'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {getIntegrityStatus(item.tags) === 'verified' ? 'Verified' : 'Relayed'}
                    </span>
                    {item.sentiment && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded leading-none ${
                        item.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.sentiment === 'Bearish' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700/30 text-slate-400'
                      }`}>
                        {item.sentiment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-4 mt-8 text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 uppercase tracking-widest">
            Load Additional Signals
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Sidebar Section */}
      <aside className="news-sidebar lg:col-span-4 space-y-8">
        
        {/* LIVE IPL RELAY SIDEBAR MONITOR */}
        <IPLStreamSidebar />

        {/* Newsletter / CTA */}
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 shadow-xl shadow-indigo-500/20">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Daily Pulse</h3>
            <p className="text-white/80 text-sm mb-6">
              Subscribe to our high-priority list for direct intelligence relayed to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Secure email address..." 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm transition-all"
              />
              <button 
                onClick={() => router.push('/news/subscribe')}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 text-sm transition-all active:scale-[0.98]"
              >
                Sign Up Now
              </button>
            </div>
            <p className="mt-4 text-[10px] text-white/40">Secure delivery. Zero tracking.</p>
          </div>
          <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
        </div>

        {/* Dynamic Filters */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h4 className="text-slate-100 font-bold mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Active Vectors
          </h4>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Region / Country</label>
              <div className="flex flex-wrap gap-2">
                {['Global', ...(availableCountries.slice(0, 8))].map((c) => (
                  <button 
                    key={c}
                    onClick={() => handleRegionChange(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeRegion === c 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vertical / Category</label>
              <div className="flex flex-wrap gap-2">
                {['All', ...(availableCategories.slice(0, 10))].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => handleFilterChange(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === cat
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trending Intelligence */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <h4 className="text-slate-100 font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            Trending Signals
          </h4>
          <div className="space-y-6">
            {trending.map((item, idx) => (
              <div 
                key={item.id} 
                className="group cursor-pointer flex gap-4"
                onClick={() => router.push(`/news/${item.slug}`)}
              >
                <span className="text-3xl font-black text-slate-800 group-hover:text-indigo-900 transition-colors leading-none pt-1">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {item.title}
                  </h5>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{item.view_count || 120} scans</span>
                    <span className="text-[10px] text-indigo-500 font-bold uppercase">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Signal Sidebar Component Integration */}
        <StrategicSignalSidebar 
          signals={trending.map(t => ({
            id: t.id,
            title: t.title,
            impact: t.impact_score || 50,
            sentiment: (t.sentiment as any) || 'Neutral',
            category: t.category || 'General'
          }))} 
          entities={['IPL 2024', 'BCCI', 'Cricket Council', 'Global Sports']}
        />

        {/* Global Intelligence Network Pulse */}
        <NetworkPulseSidebar analytics={networkAnalytics} />

        {/* Global Market Sentiment */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-2xl p-6 overflow-hidden relative">
          <h4 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Market Sentiment
          </h4>
          <div className="flex items-baseline gap-2 mb-6">
            <span className={`text-3xl font-bold tracking-tight ${sentimentStats.color}`}>{sentimentStats.label}</span>
            <span className="text-sm font-medium text-slate-500">Signal: {sentimentStats.score}/100</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Crypto Index</span>
              <span className="text-emerald-400">+2.4%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Equity Futures</span>
              <span className="text-rose-400">-0.8%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Commodity Flow</span>
              <span className="text-slate-200">Stable</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-1.5 h-8 items-end">
              {[12, 18, 14, 22, 16, 24, 18, 20, 14, 22, 16, 12].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1.5 rounded-full bg-indigo-500/40 animate-pulse-bar" 
                  style={{ 
                    height: `${h}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
