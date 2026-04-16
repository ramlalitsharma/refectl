'use client';

import { useEffect, useMemo, useState } from 'react';

import { Link, useRouter, usePathname } from '@/lib/navigation';
import { format } from 'date-fns';
import { NetworkPulseSidebar } from '@/components/news/NetworkPulseSidebar';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Book,
  BookOpen,
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Database,
  Globe,
  Info,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Library,
  MessageSquare,
  Newspaper,
  PenSquare,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { StrategicSignalSidebar } from '@/components/news/StrategicSignalSidebar';



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
  totalCount: number;
  page: number;
  pageSize: number;
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
  totalCount,
  page,
  pageSize,
  automationStatus,
  networkAnalytics
}: NewsFeedClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState(category);
  const [activeRegion, setActiveRegion] = useState(country);
  const [isBackfilling, setIsBackfilling] = useState(false);

  useEffect(() => {
    // Phase 44: Regional Backfill Detection
    if (!initialItems.length && activeRegion !== 'All' && activeRegion !== 'Global') {
      setIsBackfilling(true);
    } else {
      setIsBackfilling(false);
    }
  }, [initialItems, activeRegion]);

  // Sync state with props when the URL changes (e.g., via navbar interaction)
  useEffect(() => {
    setActiveFilter(category);
  }, [category]);

  useEffect(() => {
    setActiveRegion(country);
  }, [country]);


  const items = useMemo(() => {
    const base = initialItems || [];
    return base;
  }, [initialItems]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;
  const hasPrev = page > 1;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trending = useMemo(() => initialTrending || [], [initialTrending]);

  const lead = page === 1 ? items[0] : null;
  const secondary = page === 1 ? items.slice(1, 4) : [];
  const others = page === 1 ? items.slice(4) : items;

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
    router.push(`${pathname}?${params.toString()}`);
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
    router.push(`${pathname}?${params.toString()}`);
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleCardClick = (item: NewsItem) => {
    if (item.tags?.includes('type:external_relay') && item.source_url) {
      window.open(item.source_url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/news/${item.slug}`);
    }
  };

  return (
    <div className="news-layout-grid flex flex-col gap-12">
      {!items.length ? (
        <div className="flex flex-col items-center justify-center py-48 text-gray-500 border border-white/5 bg-[#030407] rounded-[3rem]">
          <Database className="w-16 h-16 mb-6 opacity-10 animate-pulse" />
          <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white">No Active Dispatches</h3>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#06b6d4]">Zero reports available in current dispatch</p>
          <button
            onClick={() => { setActiveFilter('All'); setActiveRegion('All'); router.push('/news'); }}
            className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
      {/* Global Stage Hero Section */}
      {lead && (
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero-stage-shell group" 
          onClick={() => handleCardClick(lead)}
        >
          <div className="absolute inset-0 bg-black">
            <img
              src={lead.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072'}
              alt={lead.image_alt || lead.title}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030407] via-[#030407]/40 to-transparent" />
          </div>

          <div className="hero-stage-content">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="intel-badge">
                <Target size={12} />
                {(lead.category || 'Global Intel').toUpperCase()}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.2em]">
                <Activity size={12} className="animate-pulse" />
                Impact Level: {lead.impact_score || 72}/100
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur">
                {lead.published_at ? format(new Date(lead.published_at), 'MMMM dd, HH:mm') : 'Active Relay'}
              </span>
            </div>

            <h1 className="hero-stage-title text-white">
              {lead.title}
            </h1>

            <p className="text-gray-400 text-lg md:text-xl line-clamp-2 max-w-4xl mb-10 leading-relaxed font-medium">
              {lead.summary || lead.content?.slice(0, 180)}...
            </p>

            <div className="flex flex-wrap items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#06b6d4] p-0.5 shadow-lg shadow-[#06b6d4]/20">
                     <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-sm font-black text-white">
                        {lead.author_name ? lead.author_name[0] : <Bot size={16} className="text-[#06b6d4]" />}
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[11px] font-black text-white uppercase tracking-wider">
                       {lead.author_name || 'Neural Intelligence'}
                     </span>
                     <span className="text-[9px] font-bold text-[#06b6d4] uppercase tracking-[0.2em]">
                       {lead.author_name ? 'Identity Verified' : 'Autonomous Ingress'}
                     </span>
                  </div>
               </div>

              {lead.source_name && (
                <div className="h-10 w-px bg-white/10 hidden md:block" />
              )}

              {lead.source_name && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lead.source_url) window.open(lead.source_url, '_blank');
                  }}
                  className="flex items-center gap-2.5 text-gray-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <Globe className="w-4 h-4 text-[#06b6d4]" />
                  Internal Origin: {lead.source_name}
                </span>
              )}

               <button className="ml-auto hidden xl:flex items-center gap-3 px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform active:scale-95">
                  Full Dossier
                  <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Primary Intelligence Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 md:px-12">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 space-y-16"
        >
          
          {/* Innovations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
             <div className="col-span-1 md:col-span-2 flex items-center justify-between mb-4">
               <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#06b6d4] mb-2">Cluster Alpha</h2>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">High-Fidelity Signals</h3>
               </div>
               <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.25em] rounded-full animate-pulse">Live Uplink</span>
             </div>

            {secondary.map((item) => (
              <motion.div
                variants={itemVariants}
                key={item.id}
                className="group cursor-pointer flex flex-col gap-4 relative"
                onClick={() => handleCardClick(item)}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5">
                  <img
                    src={item.image_url || getFallbackImage(item.category, item.id)}
                    alt={item.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded">
                      {item.category}
                    </span>
                  </div>

                  {item.impact_score && (
                     <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-[#06b6d4] text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        Impact {item.impact_score}
                     </div>
                  )}
                </div>

                <div className="px-2 space-y-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium">
                    {item.summary || item.content?.slice(0, 120)}...
                  </p>
                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {item.published_at ? format(new Date(item.published_at), 'MMM dd') : 'Just now'}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest ml-auto">
                      Access Intelligence
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Intelligence Relay - Wide Format */}
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 whitespace-nowrap">The Intelligence Relay</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-1">
              {/* Targeted Discovery Status */}
              {isBackfilling && items.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] rounded-[3rem] border border-white/5 mb-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                    <Database className="w-8 h-8 text-[#06b6d4]" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Targeted Discovery In Progress</h3>
                  <p className="text-white/40 text-xs max-w-sm font-medium uppercase tracking-wider">
                    The autonomous desk is scanning international wires for {activeRegion} specific intelligence. Please standby for synchronization.
                  </p>
                </div>
              )}

              {others.map((item) => (
                <motion.div
                  variants={itemVariants}
                  key={item.id}
                  className="group cursor-pointer flex flex-col md:flex-row gap-8 p-8 rounded-[2.5rem] bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-sm transition-all duration-500 border border-white/5 hover:border-[#06b6d4]/30 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => router.push(`/news/${item.slug}`)}
                >
                  <div className="relative h-48 w-full md:w-80 flex-shrink-0 overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5">
                    <img
                      src={item.image_url || getFallbackImage(item.category, item.id)}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  </div>

                  <div className="flex flex-col justify-center flex-1 space-y-5">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.42em] bg-[#06b6d4]/5 px-2 py-0.5 rounded">
                        {item.category?.toUpperCase() || 'GENERAL'}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]/20" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         DESK: TT-{item.id.slice(-4).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-auto">
                        {item.published_at ? format(new Date(item.published_at), 'HH:mm | MMM dd') : 'RELAYED'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2 leading-[1.15]">
                       {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-6">
                      <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4 py-2 bg-white/5 rounded-full border border-white/5 group-hover:border-[#06b6d4]/20 transition-colors">
                        {item.author_name ? (
                          <PenSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Bot className="w-4 h-4 text-[#06b6d4] animate-pulse" />
                        )}
                        <span className={item.author_name ? 'text-gray-300' : 'text-[#06b6d4]'}>
                          {item.author_name || 'Neural Intelligence'}
                        </span>
                      </span>

                      {item.sentiment && (
                        <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] border ${
                          item.sentiment === 'Bullish' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                          item.sentiment === 'Bearish' ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 
                          'border-white/10 bg-white/5 text-gray-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             item.sentiment === 'Bullish' ? 'bg-emerald-400 animate-pulse' :
                             item.sentiment === 'Bearish' ? 'bg-rose-400 animate-pulse' : 'bg-gray-400'
                          }`} />
                          {item.sentiment}
                        </div>
                      )}
                      
                      <button className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-2 text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.5em]">
                         ACCESS DISPATCH
                         <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-8 text-[11px] font-black text-gray-500 hover:text-white transition-all flex items-center justify-center gap-4 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/10 uppercase tracking-[0.6em] group animate-pulse hover:animate-none">
              <Zap className="w-5 h-5 text-[#fbbf24] transition-transform group-hover:scale-125" />
              Load Recent Updates
            </button>

            {/* Pagination Controls - Always Visible for Navigation Transparency */}
            {totalCount > 0 && (
              <div className="mt-16 flex justify-center items-center gap-6 border-t border-white/5 pt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Operational Slice</span>
                  <span className="text-xl font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10 tabular-nums">
                    {page}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                  className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
          </motion.section>

        {/* Tactical Intelligence Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          
          {/* Signal Subscription */}
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#06b6d4] to-blue-700 p-10 shadow-2xl shadow-[#06b6d4]/20 border border-white/10">
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Live Uplink</h3>
              <p className="text-white/80 text-sm font-medium mb-10 leading-relaxed uppercase tracking-wider">
                Establish a direct neural link for Tier-1 intelligence alerts.
              </p>
              
              <div className="space-y-4 mt-auto">
                <input
                  type="email"
                  placeholder="IDENTITY@REMEDY.INTEL"
                  className="w-full px-6 py-4 bg-black/20 border border-white/20 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-[11px] font-black tracking-widest transition-all backdrop-blur-md"
                />
                <button
                  onClick={() => router.push('/news/subscribe')}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all active:scale-95 text-[11px] uppercase tracking-[0.4em] shadow-xl"
                >
                  Establish Link
                </button>
              </div>
              <p className="mt-6 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-center">Encrypted Cluster. Anonymous Routing.</p>
            </div>
            <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 animate-spin-slow" />
          </div>

          {/* Region/Sector Selection - Glass Terminal Style */}
          <div className="glass-terminal rounded-[2.5rem] p-8 space-y-10">
            <h4 className="text-white font-black text-[11px] uppercase tracking-[0.5em] flex items-center gap-3">
              <Layers className="w-4 h-4 text-[#06b6d4]" />
              Strategic Vectors
            </h4>

            <div className="space-y-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Operational Region</label>
                <div className="flex flex-wrap gap-2">
                  {['Global', ...(availableCountries.filter(c => c !== 'Global').slice(0, 10))].map((c) => (
                    <button
                      key={c}
                      onClick={() => handleRegionChange(c)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeRegion === c
                        ? 'bg-[#06b6d4] text-black shadow-lg shadow-[#06b6d4]/30'
                        : 'bg-white/5 border border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Intelligence vertical</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...(availableCategories.filter(cat => cat !== 'All').slice(0, 12))].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeFilter === cat
                        ? 'bg-[#06b6d4] text-black shadow-lg shadow-[#06b6d4]/30'
                        : 'bg-white/5 border border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Signals */}
          <StrategicSignalSidebar
            signals={trending.map(t => ({
              id: t.id,
              title: t.title,
              impact: t.impact_score || 50,
              sentiment: (t.sentiment as any) || 'Neutral',
              category: t.category || 'General'
            }))}
            entities={['Market Flux', 'Geopolitical Shift', 'Neural Ingress', 'Global Markets']}
          />

          {/* Market Pulse Dashboard */}
          <div className="glass-terminal rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
             <div className="flex items-center justify-between">
                <h4 className="text-white font-black text-[11px] uppercase tracking-[0.5em] flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#10b981]" />
                  Internal Flux
                </h4>
                <div className="flex gap-1 h-3 items-end">
                   {[6, 12, 8, 14, 10].map((h, i) => (
                      <div key={i} className="w-1 bg-[#10b981]/60 rounded-full animate-pulse" style={{ height: `${h}px`, animationDelay: `${i*0.2}s` }} />
                   ))}
                </div>
             </div>
            
            <div className="flex flex-col gap-2">
              <span className={`text-5xl font-black italic tracking-tighter ${sentimentStats.color} uppercase`}>
                 {sentimentStats.label}
              </span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                 Signal Integrity: {sentimentStats.score}%
              </span>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              {[
                { label: 'Network Ingress', val: '+14.2%', color: 'text-emerald-400' },
                { label: 'Data Latency', val: '0.04ms', color: 'text-gray-400' },
                { label: 'Active Relays', val: networkAnalytics?.activeTerminals || '104', color: 'text-[#06b6d4]' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">{stat.label}</span>
                  <span className={stat.color}>{stat.val}</span>
                </div>
              ))}
            </div>

            <NetworkPulseSidebar analytics={networkAnalytics} />
          </div>

        </aside>
      </div>
    </>)}
    </div>
  );
}
