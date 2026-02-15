import { NewsService } from '@/lib/news-service';
import { Link } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Filter, Edit, Trash2, Eye, Newspaper, TrendingUp, ShieldAlert, BarChart3, Globe, CalendarDays, Target, Gauge } from 'lucide-react';
import { requireContentWriter } from '@/lib/admin-check';
import { format } from 'date-fns';
import { FadeIn } from '@/components/ui/Motion';
import { NewsImage } from '@/components/news/NewsImage';
import { getNewsAuthorsByIds } from '@/lib/news-authors';

export const dynamic = 'force-dynamic';

type StudioNews = {
    id: string;
    title?: string;
    summary?: string;
    status?: string;
    category?: string;
    country?: string;
    tags?: string[] | string;
    cover_image?: string;
    is_trending?: boolean;
    created_at?: string;
    published_at?: string;
    slug?: string;
};

type AuthorAnalytics = {
    authorId: string;
    authorName: string;
    total: number;
    published: number;
    trending: number;
    avgQuality: number;
    activeDays30: number;
    lastPublished?: string;
    impactScore: number;
};

function toSafeDate(value?: string) {
    const d = value ? new Date(value) : new Date();
    return Number.isNaN(d.getTime()) ? new Date() : d;
}

function normalizeTags(tags: StudioNews['tags']): string[] {
    if (Array.isArray(tags)) return tags.filter(Boolean);
    if (typeof tags === 'string') {
        return tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
}

function buildCadence(items: StudioNews[], days = 14) {
    const today = new Date();
    const points: Array<{ key: string; label: string; count: number }> = [];

    for (let i = days - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const key = format(day, 'yyyy-MM-dd');
        points.push({ key, label: format(day, 'dd MMM'), count: 0 });
    }

    for (const item of items) {
        const dateKey = format(toSafeDate(item.published_at || item.created_at), 'yyyy-MM-dd');
        const point = points.find((p) => p.key === dateKey);
        if (point) point.count += 1;
    }

    return points;
}

function longestPublishingStreak(items: StudioNews[]) {
    const uniqueDays = new Set<string>();
    for (const item of items) {
        uniqueDays.add(format(toSafeDate(item.published_at || item.created_at), 'yyyy-MM-dd'));
    }
    const dates = Array.from(uniqueDays)
        .map((v) => new Date(`${v}T00:00:00`))
        .sort((a, b) => a.getTime() - b.getTime());

    if (!dates.length) return 0;

    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i += 1) {
        const diff = dates[i].getTime() - dates[i - 1].getTime();
        if (diff === 24 * 60 * 60 * 1000) {
            current += 1;
            best = Math.max(best, current);
        } else {
            current = 1;
        }
    }
    return best;
}

function labelForAuthor(authorId?: string) {
    if (!authorId) return 'Unknown Desk';
    if (authorId === 'system') return 'System Desk';
    return `Desk ${authorId.slice(0, 6).toUpperCase()}`;
}

function articleQualityScore(n: StudioNews) {
    const headlineLength = (n.title || '').trim().length;
    const summaryWords = (n.summary || '').trim().split(/\s+/).filter(Boolean).length;
    const tags = normalizeTags(n.tags);
    const hasCover = Boolean((n.cover_image || '').trim());
    const isPublished = (n.status || '').toLowerCase() === 'published';

    let score = 0;
    if (headlineLength >= 42 && headlineLength <= 78) score += 25;
    else if (headlineLength >= 30) score += 12;
    if (summaryWords >= 18 && summaryWords <= 48) score += 20;
    else if (summaryWords >= 10) score += 10;
    if (hasCover) score += 20;
    if (tags.length >= 3) score += 20;
    else if (tags.length >= 1) score += 10;
    if (isPublished) score += 15;
    return Math.min(100, score);
}

export default async function NewsStudioPage() {
    await requireContentWriter();
    const news: StudioNews[] = await NewsService.getAllNews().catch(() => []);
    const publishedNews = news.filter((n) => (n.status || '').toLowerCase() === 'published');
    const draftNews = news.filter((n) => (n.status || '').toLowerCase() === 'draft');
    const trendingNews = news.filter((n) => n.is_trending);

    const cadence = buildCadence(publishedNews, 14);
    const maxCadence = Math.max(...cadence.map((c) => c.count), 1);
    const activeDays = cadence.filter((c) => c.count > 0).length;
    const streak = longestPublishingStreak(publishedNews);

    const avgHeadlineLength = publishedNews.length
        ? Math.round(
            publishedNews.reduce((acc, n) => acc + (n.title || '').trim().length, 0) / publishedNews.length
        )
        : 0;

    const avgSummaryWords = publishedNews.length
        ? Math.round(
            publishedNews.reduce((acc, n) => {
                const words = (n.summary || '').trim().split(/\s+/).filter(Boolean).length;
                return acc + words;
            }, 0) / publishedNews.length
        )
        : 0;

    const metadataReady = news.filter((n) => n.cover_image && normalizeTags(n.tags).length >= 3).length;
    const metadataReadinessRate = news.length ? Math.round((metadataReady / news.length) * 100) : 0;

    const targetCategories = ['World', 'Politics', 'Business', 'Tech', 'Science', 'Opinion', 'Culture', 'Sports', 'Health'];
    const categoryCount = new Map<string, number>();
    for (const n of publishedNews) {
        const key = (n.category || 'General').trim();
        categoryCount.set(key, (categoryCount.get(key) || 0) + 1);
    }
    const topCoverage = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    const coverageGaps = targetCategories.filter((c) => !categoryCount.has(c)).slice(0, 4);

    const consistencyScore = Math.min(
        100,
        Math.round(
            (activeDays / 14) * 45 +
            (Math.min(streak, 10) / 10) * 35 +
            (avgHeadlineLength >= 42 && avgHeadlineLength <= 78 ? 20 : 10)
        )
    );

    const authorIds = Array.from(new Set(news.map((n) => n.author_id).filter(Boolean))) as string[];
    const authorProfiles = await getNewsAuthorsByIds(authorIds);
    const authorNameMap = new Map<string, string>(
        Array.from(authorProfiles.entries()).map(([k, v]) => [k, v.name])
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byAuthor = new Map<string, AuthorAnalytics>();
    for (const item of news) {
        const authorId = item.author_id || 'system';
        const current = byAuthor.get(authorId) || {
            authorId,
            authorName: authorNameMap.get(authorId) || labelForAuthor(authorId),
            total: 0,
            published: 0,
            trending: 0,
            avgQuality: 0,
            activeDays30: 0,
            impactScore: 0,
        };
        current.total += 1;
        if ((item.status || '').toLowerCase() === 'published') current.published += 1;
        if (item.is_trending) current.trending += 1;
        current.avgQuality += articleQualityScore(item);

        const itemDate = toSafeDate(item.published_at || item.created_at);
        if (itemDate >= thirtyDaysAgo) {
            const key = format(itemDate, 'yyyy-MM-dd');
            const stamped = (current as any)._daysSet || new Set<string>();
            stamped.add(key);
            (current as any)._daysSet = stamped;
            current.activeDays30 = stamped.size;
        }
        if (!current.lastPublished || itemDate > toSafeDate(current.lastPublished)) {
            current.lastPublished = itemDate.toISOString();
        }
        byAuthor.set(authorId, current);
    }

    const authorLeaderboard = Array.from(byAuthor.values())
        .map((row) => {
            const avgQuality = row.total ? Math.round(row.avgQuality / row.total) : 0;
            const impactScore = Math.min(
                100,
                Math.round(
                    avgQuality * 0.45 +
                    Math.min(40, row.published * 4) * 0.35 +
                    Math.min(25, row.trending * 6) * 0.2
                )
            );
            return { ...row, avgQuality, impactScore };
        })
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 8);

    return (
        <div className="min-h-screen bg-elite-bg text-slate-100 p-8 lg:p-12 space-y-16 selection:bg-elite-accent-cyan/30">
            {/* Header / Brand Strip */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-elite-accent-cyan rounded-[2rem] flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-elite-accent-cyan/20">
                        RT
                    </div>
                    <div className="space-y-1">
                        <FadeIn>
                            <h1 className="text-4xl lg:text-5xl font-black flex items-center gap-4 tracking-tighter uppercase text-white leading-none">
                                Intelligence <span className="text-gradient-cyan">Studio</span>
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-slate-800" /> Professional Terminal | Node: Primary Core
                            </p>
                        </FadeIn>
                    </div>
                </div>
                <FadeIn delay={0.2}>
                    <Link href="/admin/studio/news/create">
                        <Button className="bg-white text-black hover:bg-elite-accent-cyan shadow-xl transition-all font-black uppercase text-[10px] tracking-[0.3em] h-16 px-12 rounded-[2rem]">
                            <Plus className="w-5 h-5 mr-3" />
                            Initialize Report
                        </Button>
                    </Link>
                </FadeIn>
            </div>

            {/* Performance Monitoring Indices */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Network Assets', value: news.length, color: 'text-white', icon: Newspaper, accent: 'cyan' },
                    { label: 'Live Deployments', value: publishedNews.length, color: 'text-elite-accent-emerald', icon: Globe, accent: 'emerald' },
                    { label: 'Staged Buffer', value: draftNews.length, color: 'text-elite-accent-purple', icon: ShieldAlert, accent: 'purple' },
                    { label: 'Pulse Anomalies', value: trendingNews.length, color: 'text-elite-accent-cyan', icon: TrendingUp, accent: 'cyan' }
                ].map((stat, index) => (
                    <FadeIn key={stat.label} delay={index * 0.05 + 0.3}>
                        <div className="glass-card-premium p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-elite-accent-${stat.accent}/5 rounded-full blur-3xl`} />
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{stat.label}</span>
                                <stat.icon size={16} className={`text-elite-accent-${stat.accent}`} />
                            </div>
                            <span className={`text-6xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
                        </div>
                    </FadeIn>
                ))}
            </div>

            {/* Author Performance Dashboard */}
            <FadeIn delay={0.45}>
                <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 glass-card-premium rounded-[2rem] border border-white/5 p-8 md:p-10 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                                    <Gauge size={12} className="text-elite-accent-cyan" />
                                    Author Performance Dashboard
                                </p>
                                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-3">
                                    Publishing Cadence And Editorial Consistency
                                </h3>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/5">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Consistency</span>
                                <span className={`text-lg font-black ${consistencyScore >= 75 ? 'text-elite-accent-emerald' : consistencyScore >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {consistencyScore}%
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Active Days (14d)</p>
                                <p className="text-3xl font-black text-white mt-2">{activeDays}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Longest Streak</p>
                                <p className="text-3xl font-black text-white mt-2">{streak}d</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Avg Headline</p>
                                <p className="text-3xl font-black text-white mt-2">{avgHeadlineLength}</p>
                                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">chars</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Avg Summary</p>
                                <p className="text-3xl font-black text-white mt-2">{avgSummaryWords}</p>
                                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">words</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                    <CalendarDays size={12} className="text-elite-accent-cyan" />
                                    14-Day Publish Activity
                                </p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Published assets/day</p>
                            </div>
                            <div
                                className="grid gap-2 items-end h-32"
                                style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
                            >
                                {cadence.map((point) => (
                                    <div key={point.key} className="flex flex-col items-center gap-2">
                                        <div
                                            className="w-full rounded-md bg-gradient-to-t from-elite-accent-cyan/90 to-elite-accent-cyan/30 min-h-[6px]"
                                            style={{ height: `${Math.max(6, Math.round((point.count / maxCadence) * 95))}px` }}
                                            title={`${point.label}: ${point.count}`}
                                        />
                                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{point.label.slice(0, 2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-6">
                        <div className="glass-card-premium rounded-[2rem] border border-white/5 p-7 space-y-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                <Target size={12} className="text-elite-accent-cyan" />
                                Coverage Intelligence
                            </p>
                            <div className="space-y-3">
                                {topCoverage.length ? topCoverage.map((row) => (
                                    <div key={row.category} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-slate-300">{row.category}</span>
                                        <span className="text-elite-accent-cyan">{row.count}</span>
                                    </div>
                                )) : (
                                    <p className="text-[11px] text-slate-500">No category data yet.</p>
                                )}
                            </div>
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500 mb-2">Coverage Gaps</p>
                                <div className="flex flex-wrap gap-2">
                                    {coverageGaps.length ? coverageGaps.map((gap) => (
                                        <span key={gap} className="px-2.5 py-1 rounded-lg border border-amber-400/30 text-amber-300 text-[9px] font-black uppercase tracking-widest">
                                            {gap}
                                        </span>
                                    )) : (
                                        <span className="px-2.5 py-1 rounded-lg border border-emerald-400/30 text-emerald-300 text-[9px] font-black uppercase tracking-widest">
                                            Balanced Coverage
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card-premium rounded-[2rem] border border-white/5 p-7 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Metadata Readiness</p>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-elite-accent-cyan to-elite-accent-emerald"
                                    style={{ width: `${metadataReadinessRate}%` }}
                                />
                            </div>
                            <p className="text-sm text-slate-300">
                                {metadataReadinessRate}% of assets have cover image and 3+ tags.
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Improve for stronger search and editorial discoverability.
                            </p>
                        </div>

                        <div className="glass-card-premium rounded-[2rem] border border-white/5 p-7 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Byline Leaderboard</p>
                            <div className="space-y-3">
                                {authorLeaderboard.length ? authorLeaderboard.slice(0, 5).map((author, idx) => (
                                    <div key={author.authorId} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] text-white font-black truncate pr-2">
                                                {idx + 1}. {author.authorName}
                                            </p>
                                            <span className="text-[10px] text-elite-accent-cyan font-black">{author.impactScore}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                                            {author.published} published • {author.trending} trending • {author.avgQuality}% quality
                                        </p>
                                    </div>
                                )) : (
                                    <p className="text-[11px] text-slate-500">No byline data yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="glass-card-premium rounded-[2rem] border border-white/5 p-7 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Author Profiles</p>
                            <div className="space-y-3">
                                {authorLeaderboard.slice(0, 3).map((author) => {
                                    const profile = authorProfiles.get(author.authorId);
                                    return (
                                        <div key={author.authorId} className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/10 relative">
                                                    {profile?.profilePicture ? (
                                                        <NewsImage src={profile.profilePicture} alt={profile.name} className="w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white">
                                                            {(profile?.name || author.authorName).slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-white truncate">{profile?.name || author.authorName}</p>
                                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate">{profile?.role || 'News Desk'}</p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                                                {profile?.bio || 'Strategic newsroom author focused on high-quality, verified reporting.'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </FadeIn>

            {/* Author Performance Table */}
            <FadeIn delay={0.48}>
                <section className="glass-card-premium rounded-[2rem] border border-white/5 p-7 md:p-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
                            Author Performance Matrix
                        </h3>
                        <span className="text-[9px] uppercase tracking-widest text-slate-600">
                            Ranked by impact score
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left">
                            <thead>
                                <tr className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 border-b border-white/10">
                                    <th className="py-3 pr-4">Byline</th>
                                    <th className="py-3 pr-4">Published</th>
                                    <th className="py-3 pr-4">Trending</th>
                                    <th className="py-3 pr-4">Quality</th>
                                    <th className="py-3 pr-4">Active Days(30d)</th>
                                    <th className="py-3 pr-4">Last Publish</th>
                                    <th className="py-3 pr-0 text-right">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {authorLeaderboard.map((author) => (
                                    <tr key={author.authorId}>
                                        <td className="py-3.5 pr-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white">{author.authorName}</span>
                                                <span className="text-[10px] text-slate-500">{author.authorId}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-300 text-sm font-bold">{author.published}</td>
                                        <td className="py-3.5 pr-4 text-slate-300 text-sm font-bold">{author.trending}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className="text-sm font-black text-slate-200">{author.avgQuality}%</span>
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-300 text-sm font-bold">{author.activeDays30}</td>
                                        <td className="py-3.5 pr-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            {author.lastPublished ? format(toSafeDate(author.lastPublished), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="py-3.5 pr-0 text-right">
                                            <span className={`text-sm font-black ${author.impactScore >= 75 ? 'text-elite-accent-emerald' : author.impactScore >= 55 ? 'text-amber-300' : 'text-red-300'}`}>
                                                {author.impactScore}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </FadeIn>

            {/* Main Terminal (Table) */}
            <FadeIn delay={0.5}>
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                            <BarChart3 size={14} className="text-elite-accent-cyan" /> Intelligence Asset Ledger
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-elite-accent-cyan transition-colors" />
                                <input
                                    placeholder="Scan Protocol..."
                                    className="pl-14 pr-8 h-12 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-elite-accent-cyan/50 focus:bg-white/10 transition-all w-72 placeholder:text-slate-700"
                                />
                            </div>
                            <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {news.length === 0 ? (
                        <div className="text-center py-40 glass-card-premium rounded-[4rem] border border-dashed border-white/5">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/5">
                                <Newspaper className="w-10 h-10 text-slate-700" />
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Terminal Idle</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-4 mb-12 font-black uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                                No global intelligence reports detected in local buffer. Initialize a broadcast to populate.
                            </p>
                            <Link href="/admin/studio/news/create">
                                <Button className="bg-elite-accent-cyan text-black px-12 h-16 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-elite-accent-cyan/20 hover:bg-white transition-all">Establish Relay</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card-premium rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5">
                                        <th className="p-10 border-b border-white/5">Intelligence Asset</th>
                                        <th className="p-10 border-b border-white/5 text-center">Byline</th>
                                        <th className="p-10 border-b border-white/5 text-center">Sector</th>
                                        <th className="p-10 border-b border-white/5 text-center">Protocol Stutus</th>
                                        <th className="p-10 border-b border-white/5 text-right pr-16">Data Access</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {news.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-white/5 transition-all">
                                            <td className="p-10">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-28 h-18 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5 p-1 relative">
                                                        {item.cover_image ? (
                                                            <div className="w-full h-full rounded-xl overflow-hidden relative">
                                                                <NewsImage
                                                                    src={item.cover_image}
                                                                    alt={item.title || 'News cover'}
                                                                    className="w-full h-full group-hover:scale-110 transition-transform duration-1000"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-xl">
                                                                <Newspaper className="w-6 h-6 text-slate-800" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black text-white group-hover:text-elite-accent-cyan transition-all line-clamp-1 uppercase tracking-tighter">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4">
                                                            {item.is_trending && (
                                                                <span className="text-elite-accent-cyan text-[8px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-1.5">
                                                                    <TrendingUp size={10} /> TRENDING PULSE
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.18em]">
                                                <Link
                                                    href={`/news/author/${encodeURIComponent(item.author_id || 'system')}`}
                                                    target="_blank"
                                                    className="hover:text-elite-accent-cyan transition-colors"
                                                >
                                                    {authorNameMap.get(item.author_id || '') || labelForAuthor(item.author_id)}
                                                </Link>
                                            </td>
                                            <td className="p-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                                {item.category || 'General'}
                                            </td>
                                            <td className="p-10 text-center">
                                                <span className={`inline-flex items-center px-5 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.3em] border ${item.status === 'published'
                                                    ? 'bg-elite-accent-emerald/10 text-elite-accent-emerald border-elite-accent-emerald/20 shadow-lg shadow-elite-accent-emerald/5'
                                                    : 'bg-elite-accent-purple/10 text-elite-accent-purple border-elite-accent-purple/20'
                                                    }`}>
                                                    {item.status === 'published' ? 'Active Relay' : 'Draft Staged'}
                                                </span>
                                            </td>
                                            <td className="p-10 text-right pr-16">
                                                <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0">
                                                    <Link href={`/news/${item.slug}`} target="_blank">
                                                        <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/studio/news/edit/${item.id}`}>
                                                        <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-elite-accent-cyan/10 hover:text-elite-accent-cyan group/edit transition-all">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" variant="ghost" className="h-12 w-12 p-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </FadeIn>
        </div>
    );
}
