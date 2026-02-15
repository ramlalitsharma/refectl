'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format, eachDayOfInterval, subMonths } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

interface HeatmapData {
    heatmapData: Array<{
        date: string;
        count: number;
        minutes: number;
        intensity: number;
    }>;
    stats: {
        activeDays: number;
        totalDays: number;
        activityRate: number;
        longestStreak: number;
        currentStreak: number;
        totalActivities: number;
    };
}

interface ActivityHeatmapProps {
    months?: number;
}

const getColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255, 255, 255, 0.03)';
    if (intensity === 1) return 'rgba(6, 182, 212, 0.2)';
    if (intensity === 2) return 'rgba(6, 182, 212, 0.4)';
    if (intensity === 3) return 'rgba(6, 182, 212, 0.7)';
    return '#06b6d4';
};

const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return 'Dormant';
    if (intensity === 1) return 'Light Sync';
    if (intensity === 2) return 'Moderate Relay';
    if (intensity === 3) return 'Active Pulse';
    return 'Maximum Output';
};

export function ActivityHeatmap({ months = 3 }: ActivityHeatmapProps = {}) {
    const [data, setData] = useState<HeatmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; intensity: number; minutes: number } | null>(null);

    useEffect(() => {
        fetchHeatmap();
    }, [months]);

    const fetchHeatmap = async () => {
        try {
            const res = await fetch(`/api/analytics/activity-heatmap?months=${months}`);
            if (res.status === 401) { setLoading(false); return; }
            if (!res.ok) throw new Error('Failed to fetch activity heatmap');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching heatmap:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-2xl" />
                    ))}
                </div>
                <div className="h-40 bg-white/5 rounded-[2rem]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Neural Sync Interrupted</div>
            </div>
        );
    }

    if (!data) return null;

    const activityMap = new Map(data.heatmapData.map(d => [d.date, d]));
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks: Array<Array<{ date: Date; activity?: typeof data.heatmapData[0] }>> = [];
    let currentWeek: typeof weeks[0] = [];

    allDays.forEach((day, index) => {
        const dayOfWeek = day.getDay();
        const dateStr = format(day, 'yyyy-MM-dd');
        const activity = activityMap.get(dateStr);

        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
        currentWeek.push({ date: day, activity });

        if (index === allDays.length - 1) {
            weeks.push(currentWeek);
        }
    });

    const stats = data.stats;

    return (
        <div className="space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-cyan/20 transition-all">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Output</div>
                    <div className="text-2xl font-black text-white">{stats.totalActivities}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-emerald/20 transition-all">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sync Nodes</div>
                    <div className="text-2xl font-black text-white">{stats.activeDays}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-cyan/20 transition-all">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Relay Streak</div>
                    <div className="text-2xl font-black text-elite-accent-cyan">{stats.currentStreak}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-purple/20 transition-all">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peak Relay</div>
                    <div className="text-2xl font-black text-white">{stats.longestStreak}</div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="relative">
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-1.5 min-w-max">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1.5">
                                {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                                    const dayData = week.find(d => d.date.getDay() === dayOfWeek);
                                    const activity = dayData?.activity;
                                    return (
                                        <div
                                            key={`${weekIndex}-${dayOfWeek}`}
                                            className="w-3.5 h-3.5 rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                            style={{
                                                backgroundColor: activity ? getColor(activity.intensity) : 'rgba(255,255,255,0.03)',
                                            }}
                                            onMouseEnter={() => activity && setHoveredDay(activity)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tooltip */}
                <div className={`mt-6 h-14 flex items-center gap-4 transition-all duration-300 ${hoveredDay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {hoveredDay && (
                        <>
                            <div className="px-4 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg">
                                {format(new Date(hoveredDay.date), 'MMM dd')}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white">
                                {hoveredDay.count} Reagents <span className="text-slate-500 px-2">•</span> {hoveredDay.minutes}m Flow <span className="text-slate-500 px-2">•</span> <span className="text-elite-accent-cyan">{getIntensityLabel(hoveredDay.intensity)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Flux Density</div>
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black uppercase text-slate-700">Dormant</span>
                    <div className="flex gap-1.5">
                        {[0, 1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className="w-3.5 h-3.5 rounded-sm"
                                style={{ backgroundColor: getColor(level) }}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-700">Critical</span>
                </div>
            </div>
        </div>
    );
}
