'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, useRouter, usePathname } from '@/lib/navigation';
import { useLocale } from 'next-intl';
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

import ReactCountryFlag from 'react-country-flag';

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
  cover_image?: string;
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

const COUNTRY_CODES: Record<string, string> = {
  "Nepal": "NP",
  "India": "IN",
  "China": "CN",
  "Japan": "JP",
  "Bangladesh": "BD",
  "Pakistan": "PK",
  "Sri Lanka": "LK",
  "UAE": "AE",
  "Serbia": "RS",
  "UK": "GB",
  "Germany": "DE",
  "France": "FR",
  "Russia": "RU",
  "Ukraine": "UA",
  "Norway": "NO",
  "Switzerland": "CH",
  "USA": "US",
  "Canada": "CA",
  "Brazil": "BR",
  "Mexico": "MX",
  "Argentina": "AR",
  "South Africa": "ZA",
  "Nigeria": "NG",
  "Egypt": "EG",
  "Australia": "AU",
  "Global": "UN",
};

const COUNTRY_TO_LOCALE: Record<string, string> = {
  "Nepal": "ne",
  "India": "hi",
  "Malaysia": "ms",
  "China": "zh",
  "Japan": "ja",
  "Bangladesh": "bn",
  "Pakistan": "ur",
  "UAE": "ar",
  "UK": "en",
  "USA": "en",
  "Canada": "en",
  "Brazil": "pt",
  "Mexico": "es",
  "Argentina": "es",
  "France": "fr",
  "Germany": "de",
  "Russia": "ru",
  "Norway": "en",
  "Switzerland": "de",
  "South Africa": "en",
  "Nigeria": "en",
  "Egypt": "ar",
  "Australia": "en",
  "Global": "en",
  "Malaysia": "ms",
};

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
  pageSize = 30,
  automationStatus,
  networkAnalytics
}: NewsFeedClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeFilter, setActiveFilter] = useState(category);
  const [activeRegion, setActiveRegion] = useState(country);
  const locale = useLocale();
  // ── Instant Client Fetch State ──────────────────────────────────
  const [clientItems, setClientItems] = useState<typeof initialItems | null>(null);
  const [clientTotalCount, setClientTotalCount] = useState<number | null>(null);
  const [isFetchingClient, setIsFetchingClient] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const fetchNewsInstant = async (filterCat: string, filterCountry: string, pg = 1) => {
    // Cancel any in-flight request
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    setIsFetchingClient(true);
    try {
      const params = new URLSearchParams();
      if (filterCat && filterCat !== 'All') params.set('category', filterCat);
      if (filterCountry && filterCountry !== 'All' && filterCountry !== 'Global') params.set('country', filterCountry);
      if (pg > 1) params.set('page', String(pg));
      const res = await fetch(`/api/public/news?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      let items = data.items || [];
      let count = data.totalCount ?? items.length;

      // ── Client-side Global Fallback ──────────────────────────────────────
      // If the specific country returns 0 articles, show global news immediately
      // while Mota CEO seeds that country in the background.
      if (items.length === 0 && filterCountry && filterCountry !== 'All' && filterCountry !== 'Global') {
        const globalParams = new URLSearchParams();
        if (filterCat && filterCat !== 'All') globalParams.set('category', filterCat);
        if (pg > 1) globalParams.set('page', String(pg));
        const globalRes = await fetch(`/api/public/news?${globalParams.toString()}`, { signal: controller.signal });
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          items = globalData.items || [];
          count = globalData.totalCount ?? items.length;
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      setClientItems(items);
      setClientTotalCount(count);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setClientItems([]);
    } finally {
      setIsFetchingClient(false);
    }
  };
  // ────────────────────────────────────────────────────────────────

  const handleLocaleChange = (newLocale: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    router.push(`${pathname}?${searchParams.toString()}`, { locale: newLocale });
  };

  // Phase 60: Geographic Intelligence Toggle
  const [userCountry, setUserCountry] = useState<string | null>(null);

  useEffect(() => {
    const cachedCountry = localStorage.getItem('user_geo_country');
    if (cachedCountry) {
      setUserCountry(cachedCountry);
      return;
    }

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_name) {
          localStorage.setItem('user_geo_country', data.country_name);
          setUserCountry(data.country_name);
        }
      })
      .catch(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('Kuala_Lumpur') || tz.includes('Kuching')) setUserCountry('Malaysia');
        if (tz.includes('Kathmandu')) setUserCountry('Nepal');
        if (tz.includes('Calcutta') || tz.includes('Kolkata')) setUserCountry('India');
      });
  }, []);

  const relevantLocales = useMemo(() => {
    const list = [{ code: 'en', label: 'EN' }];

    // If Global/Home, add core supported languages
    if (activeRegion === 'All' || activeRegion === 'Global') {
      list.push({ code: 'es', label: 'ES' });
      list.push({ code: 'fr', label: 'FR' });
    }

    // 1. Regional Language (The desk they are viewing)
    const regionLocale = COUNTRY_TO_LOCALE[activeRegion];
    if (regionLocale && regionLocale !== 'en') {
      list.push({ code: regionLocale, label: regionLocale.toUpperCase() });
    }

    // 2. Current Locale (from URL state)
    if (locale && !list.some(l => l.code === locale)) {
      list.push({ code: locale, label: locale.toUpperCase() });
    }

    // 3. User's Geographical Language (Where they are sitting)
    if (userCountry) {
      const userGeoLocale = COUNTRY_TO_LOCALE[userCountry];
      if (userGeoLocale && !list.some(l => l.code === userGeoLocale)) {
        list.push({ code: userGeoLocale, label: userGeoLocale.toUpperCase() });
      }
    }

    return list.filter((v, i, a) => a.findIndex(t => t.code === v.code) === i);
  }, [activeRegion, locale, userCountry]);
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
    // Prefer client-fetched items (instant, no SSR reload)
    // Fall back to server-rendered initial items
    return clientItems !== null ? clientItems : (initialItems || []);
  }, [clientItems, initialItems]);

  const effectiveTotalCount = clientTotalCount !== null ? clientTotalCount : totalCount;

  const totalPages = Math.ceil(effectiveTotalCount / pageSize);
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
  const secondary = page === 1 ? items.slice(1, 20) : [];
  const others = page === 1 ? items.slice(20) : items;

  // Helper to check for trust tags
  const getIntegrityStatus = (tags: string[] = []) => {
    if (tags.some(t => t.includes('integrity_failure'))) return 'failed';
    if (tags.includes('multi_source_verified')) return 'verified';
    if (tags.includes('source_trusted')) return 'trusted';
    return 'neutral';
  };

  const handleFilterChange = (newCat: string) => {
    setActiveFilter(newCat);
    setClientItems(null); // clear stale cache immediately
    fetchNewsInstant(newCat, activeRegion);
    // Update URL silently without SSR reload
    const params = new URLSearchParams();
    if (newCat !== 'All') params.set('category', newCat);
    if (activeRegion !== 'All' && activeRegion !== 'Global') params.set('country', activeRegion);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
    setClientItems(null); // clear stale cache immediately
    fetchNewsInstant(activeFilter, newReg);
    // Update URL silently without SSR reload
    const params = new URLSearchParams();
    if (activeFilter !== 'All') params.set('category', activeFilter);
    if (newReg !== 'All' && newReg !== 'Global') params.set('country', newReg);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
      {/* Instant-loading shimmer overlay */}
      {isFetchingClient && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent animate-pulse" />
        </div>
      )}
      {!items.length ? (
        activeRegion !== 'Global' && activeRegion !== 'All' ? (
          <div className="flex flex-col items-center justify-center py-48 text-center border border-[#06b6d4]/20 bg-[#030407] rounded-[3rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-[#06b6d4]/5 animate-pulse" />
            <div className="relative z-10 px-8">
              <div className="relative mb-12 flex justify-center">
                <div className="absolute inset-0 bg-[#06b6d4]/30 rounded-full blur-[80px] animate-pulse" />
                <div className="w-32 h-32 rounded-full border-4 border-[#06b6d4]/20 border-t-[#06b6d4] animate-spin flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                  <Globe className="text-[#06b6d4]" size={56} />
                </div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white mb-6">Scanning Intelligence Vector: {activeRegion}</h3>
              <p className="max-w-xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed font-medium italic">
                Our autonomous roaming engine is currently hunting for verified reports across native {activeRegion} intelligence nodes. High-fidelity signals will appear here as soon as they are decrypted and verified by the autonomous desk.
              </p>
              <div className="mt-12 flex items-center justify-center gap-4 text-[11px] font-black text-[#06b6d4] uppercase tracking-[0.6em] animate-pulse">
                <Zap size={16} />
                Uplink Established - Waiting for Data...
              </div>
            </div>
          </div>
        ) : (
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
        )
      ) : (
        <>
          {/* World-Class Lead Intelligence Grid */}
          {lead && page === 1 && (
            <div className="px-4 md:px-12 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Primary Cinematic Lead */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-8 relative overflow-hidden rounded-[3.5rem] bg-black border border-white/5 group cursor-pointer aspect-[16/10] lg:aspect-auto h-[500px] lg:h-[700px]"
                  onClick={() => handleCardClick(lead)}
                >
                  <div className="absolute inset-0">
                    <img
                      src={lead.cover_image || lead.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072'}
                      alt={lead.title}
                      className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-[#030407]/60 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <span className="px-4 py-1.5 bg-[#06b6d4] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-[#06b6d4]/20">
                        {lead.category || 'Lead Intel'}
                      </span>
                      <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xl">
                        {lead.published_at ? format(new Date(lead.published_at), 'MMM dd, HH:mm') : 'Live Relay'}
                      </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.95] mb-8 max-w-5xl">
                      {lead.title}
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl line-clamp-2 max-w-3xl mb-12 leading-relaxed font-medium">
                      {lead.summary || lead.content?.slice(0, 180)}...
                    </p>

                    <div className="flex items-center gap-6 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center">
                          <Bot size={20} className="text-[#06b6d4]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white uppercase tracking-wider">
                            {lead.author_name || 'Terai Times Desk'}
                          </span>
                          <span className="text-[9px] font-bold text-[#06b6d4] uppercase tracking-[0.3em]">
                            Verified Intelligence
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-8">
                        <span className="hidden md:flex items-center gap-3 text-gray-500 text-[11px] font-black uppercase tracking-[0.3em]">
                          <Globe className="w-4 h-4" />
                          {lead.source_name || 'Global Newsroom'}
                        </span>
                        <button className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-transform">
                          Open Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Top Dispatches Sidebar Grid */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[11px] font-black text-[#06b6d4] uppercase tracking-[0.5em]">Top Dispatches</h2>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                    </div>
                  </div>

                  {secondary.slice(0, 3).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex gap-6 cursor-pointer"
                      onClick={() => handleCardClick(item)}
                    >
                      <div className="w-32 h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden border border-white/5 bg-slate-900">
                        <img 
                          src={item.cover_image || item.image_url || getFallbackImage(item.category, item.id)} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-2">
                        <span className="text-[9px] font-black text-[#06b6d4] uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                          {item.published_at ? format(new Date(item.published_at), 'HH:mm') : 'Just now'}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Revenue Magnet: Sponsored Intelligence Slot */}
                  <div className="mt-auto p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative group overflow-hidden cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp size={60} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4 block">Institutional Intelligence</span>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter italic mb-4 leading-none">
                        Deploy Capital with Precision Geopolitics
                      </h4>
                      <button className="flex items-center gap-3 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                        View Briefing <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High-Density Content Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 md:px-12">
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-9 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {/* Regional or Global Desk Header - Integrated as a Wide Hero Banner */}
                {activeRegion !== 'All' && activeRegion !== 'Global' ? (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 2xl:col-span-4 mb-6 p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col md:flex-row items-center justify-between group backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Globe size={120} />
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-16 h-16 rounded-[2rem] bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center">
                        <Globe className="text-[#06b6d4]" size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
                          <h4 className="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.5em]">Active Regional Link</h4>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{activeRegion} Dispatch</h2>
                      </div>
                      {COUNTRY_CODES[activeRegion] && (
                        <ReactCountryFlag
                          countryCode={COUNTRY_CODES[activeRegion]}
                          svg
                          style={{ width: '40px', height: '30px' }}
                          className="rounded shadow-2xl border border-white/10 ml-4"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 mt-8 md:mt-0 relative z-10">
                      <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
                        {relevantLocales.map((loc) => (
                          <button
                            key={loc.code}
                            onClick={() => handleLocaleChange(loc.code)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${locale === loc.code ? 'bg-[#06b6d4] text-black shadow-xl shadow-[#06b6d4]/30' : 'text-gray-500 hover:text-white'}`}
                          >
                            {loc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 2xl:col-span-4 mb-6 p-8 bg-gradient-to-br from-[#06b6d4]/10 via-[#06b6d4]/5 to-transparent border border-[#06b6d4]/20 rounded-[3rem] flex items-center gap-10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Globe size={160} />
                    </div>
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#06b6d4]/20 border border-[#06b6d4]/30 flex items-center justify-center shadow-2xl shadow-[#06b6d4]/20">
                      <Globe className="text-[#06b6d4] animate-pulse" size={40} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-ping" />
                        <h4 className="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.5em]">Primary Intelligence Grid</h4>
                      </div>
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Global News Desk</h2>
                    </div>

                    <div className="flex items-center gap-6 mt-8 md:mt-0 relative z-10">
                      <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
                        {relevantLocales.map((loc) => (
                          <button
                            key={loc.code}
                            onClick={() => handleLocaleChange(loc.code)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${locale === loc.code ? 'bg-[#06b6d4] text-black shadow-xl shadow-[#06b6d4]/30' : 'text-gray-500 hover:text-white'}`}
                          >
                            {loc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                )}

                {/* Sub-Header: Secondary Intelligence Flux - High Density */}
                <div className="col-span-1 md:col-span-2 xl:col-span-3 2xl:col-span-4 flex items-center justify-between my-2 border-y border-white/5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Intelligence Relay Feed</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Channels: 42</span>
                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-blue-500/40 rounded-full" />
                    </div>
                  </div>
                </div>

                {items.length === 0 && activeRegion !== 'Global' && activeRegion !== 'All' && (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 py-48 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-12">
                      <div className="absolute inset-0 bg-[#06b6d4]/20 rounded-full blur-[100px] animate-pulse" />
                      <div className="w-40 h-40 rounded-full border-4 border-[#06b6d4]/10 border-t-[#06b6d4] animate-spin flex items-center justify-center">
                        <Globe className="text-[#06b6d4]" size={64} />
                      </div>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">Scanning Global Matrix...</h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed font-medium italic opacity-60">
                      Our autonomous roaming engine is fetching verified reports from native {activeRegion} intelligence nodes.
                    </p>
                  </div>
                )}

                {/* Dynamic Content Grid: Priority Regional + Global Fallback */}
                {(() => {
                  const displayItems = secondary.length > 4 
                    ? secondary.slice(4, 44) 
                    : items.slice(0, 40);
                  
                  return displayItems.map((item, idx) => (
                    <motion.div
                      variants={itemVariants}
                      key={item.id}
                      className={`group cursor-pointer flex flex-col gap-3 relative p-2 rounded-2xl hover:bg-white/[0.02] transition-all duration-300 ${idx === 0 && secondary.length > 4 ? 'md:col-span-2' : ''}`}
                      onClick={() => handleCardClick(item)}
                    >
                      <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5 ${idx === 0 && secondary.length > 4 ? 'aspect-[21/9]' : 'aspect-video'}`}>
                        <img
                          src={item.cover_image || item.image_url || getFallbackImage(item.category, item.id)}
                          alt={item.title}
                          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
                        
                        <div className="absolute top-2 left-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[7px] font-black uppercase tracking-widest rounded-md">
                            {item.category || 'INTELLIGENCE'}
                          </span>
                          {secondary.length <= 4 && (
                            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[7px] font-black uppercase tracking-widest rounded-md">
                              GLOBAL FALLBACK
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[13px] font-bold text-white leading-tight group-hover:text-[#06b6d4] transition-colors line-clamp-2 uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            {item.source_name || 'TT RELAY'}
                          </span>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            {item.published_at ? format(new Date(item.published_at), 'MMM dd') : 'NOW'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Intelligence Relay - Wide Format */}
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 whitespace-nowrap">Global News Stream</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {/* Targeted Discovery Status */}
                  {isBackfilling && items.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] rounded-[3rem] border border-white/5 mb-12">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                        <Database className="w-8 h-8 text-[#06b6d4]" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Searching for Local News</h3>
                      <p className="text-white/40 text-xs max-w-sm font-medium uppercase tracking-wider">
                        We are currently fetching the latest verified reports from {activeRegion}. Please standby.
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
                          src={item.cover_image || item.image_url || getFallbackImage(item.category, item.id)}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = getFallbackImage(item.category, item.id);
                          }}
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
                            {item.source_name || 'Newsroom'}
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
                            <span className="text-gray-300">
                              {item.author_name || 'Terai Times Desk'}
                            </span>
                          </span>

                          {item.sentiment && (
                            <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] border ${item.sentiment === 'Bullish' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                                item.sentiment === 'Bearish' ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' :
                                  'border-white/10 bg-white/5 text-gray-400'
                              }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.sentiment === 'Bullish' ? 'bg-emerald-400 animate-pulse' :
                                  item.sentiment === 'Bearish' ? 'bg-rose-400 animate-pulse' : 'bg-gray-400'
                                }`} />
                              {item.sentiment}
                            </div>
                          )}

                          <button className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-2 text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.5em]">
                            READ ARTICLE
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  className="w-full py-8 text-[11px] font-black text-gray-500 hover:text-white transition-all flex items-center justify-center gap-4 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/10 uppercase tracking-[0.6em] group hover:animate-none"
                  onClick={() => fetchNewsInstant(activeFilter, activeRegion)}
                >
                  <Zap className="w-5 h-5 text-[#fbbf24] transition-transform group-hover:scale-125" />
                  {isFetchingClient ? 'Updating Feed...' : 'Load Latest Updates'}
                </button>

                {/* Pagination Controls - Always Visible for Navigation Transparency */}
                {effectiveTotalCount > 0 && (
                  <div className="mt-16 flex justify-center items-center gap-6 border-t border-white/5 pt-12">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronDown className="w-6 h-6 rotate-90" />
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Page</span>
                      <span className="text-xl font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10 tabular-nums">
                        {page}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">of {Math.max(1, Math.ceil(effectiveTotalCount / pageSize))}</span>
                    </div>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(effectiveTotalCount / pageSize)}
                      className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* High-Value News Sidebar - Revenue & Engagement Focused */}
            <aside className="lg:col-span-3 space-y-10">
              {/* Geopolitical Market Pulse - Revenue Indicator */}
              <div className="p-8 rounded-[2.5rem] bg-black border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#06b6d4]" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 flex items-center gap-2">
                  <Activity size={12} className="text-[#06b6d4]" />
                  Market Pulse
                </h4>
                <div className="space-y-5">
                  {[
                    { label: 'S&P 500', val: '5,123.4', change: '+1.2%', up: true },
                    { label: 'Gold (XAU)', val: '$2,342.1', change: '+0.8%', up: true },
                    { label: 'Crude Oil', val: '$84.5', change: '-2.4%', up: false },
                    { label: 'Bitcoin', val: '$64,231', change: '+3.1%', up: true }
                  ].map((market, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{market.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-white tabular-nums">{market.val}</span>
                        <span className={`text-[9px] font-black ${market.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {market.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Simple Newsletter Signup */}
              <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 to-black p-10 border border-white/10 shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">News Updates</h3>
                  <p className="text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest leading-relaxed">
                    Subscribe for the latest global headlines delivered to your inbox.
                  </p>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="EMAIL@ADDRESS.COM"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 text-[10px] font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                    />
                    <button className="w-full py-5 bg-[#06b6d4] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>

              {/* Trending Topics - Clean List */}
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-8">Trending Now</h4>
                <div className="space-y-6">
                  {trending.slice(0, 5).map((t, i) => (
                    <Link key={t.id} href={`/news/${t.slug}`} className="group block">
                      <div className="flex gap-4">
                        <span className="text-2xl font-black text-white/10 group-hover:text-[#06b6d4]/40 transition-colors tabular-nums">0{i+1}</span>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-white group-hover:text-[#06b6d4] transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                            {t.title}
                          </h5>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t.category}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Ad/Revenue Magnet: Institutional Access */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#06b6d4]/10 to-transparent border border-[#06b6d4]/20">
                <h5 className="text-[10px] font-black text-[#06b6d4] uppercase tracking-[0.4em] mb-4">Enterprise Tiers</h5>
                <p className="text-white font-bold text-xs mb-6 leading-relaxed uppercase tracking-tight">Unlock Terminal Access for institutional geopolitics.</p>
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                  Request Access
                </button>
              </div>
            </aside>
          </div>
        </>)}
    </div>
  );
}
