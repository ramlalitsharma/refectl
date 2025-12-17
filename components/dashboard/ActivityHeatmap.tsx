'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format, eachDayOfInterval, subMonths } from 'date-fns';

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
    if (intensity === 0) return '#f1f5f9'; // slate-100 - No activity
    if (intensity === 1) return '#ccfbf1'; // teal-100 - Light
    if (intensity === 2) return '#5eead4'; // teal-300 - Moderate
    if (intensity === 3) return '#14b8a6'; // teal-500 - Active
    return '#0d9488'; // teal-600 - Very active
};

const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return 'No activity';
    if (intensity === 1) return 'Light activity';
    if (intensity === 2) return 'Moderate activity';
    if (intensity === 3) return 'Active';
    return 'Very active';
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

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        📅 Activity Heatmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                    <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardContent className="p-6">
                    <div className="text-center space-y-2">
                        <div className="text-3xl">⚠️</div>
                        <div className="text-sm font-medium text-red-600">Failed to load activity heatmap</div>
                        <div className="text-xs text-red-500">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    // Create a map for quick lookups
    const activityMap = new Map(data.heatmapData.map(d => [d.date, d]));

    // Generate all days for the period
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Group by weeks
    const weeks: Array<Array<{ date: Date; activity?: typeof data.heatmapData[0] }>> = [];
    let currentWeek: typeof weeks[0] = [];

    allDays.forEach((day, index) => {
        const dayOfWeek = day.getDay(); // 0 = Sunday
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
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                    <span>📅 Activity Heatmap</span>
                    <span className="text-sm font-normal text-slate-500 normal-case">
                        Last {months} months
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 rounded-lg bg-teal-50 border border-teal-200">
                            <div className="text-xl font-bold text-teal-600">{stats.totalActivities}</div>
                            <div className="text-xs text-teal-700">Activities</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="text-xl font-bold text-emerald-600">{stats.activeDays}</div>
                            <div className="text-xs text-emerald-700">Active Days</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-cyan-50 border border-cyan-200">
                            <div className="text-xl font-bold text-cyan-600">{stats.currentStreak}</div>
                            <div className="text-xs text-cyan-700">Current Streak</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-xl font-bold text-blue-600">{stats.longestStreak}</div>
                            <div className="text-xs text-blue-700">Best Streak</div>
                        </div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="overflow-x-auto pb-2">
                        <div className="flex gap-1 min-w-max">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                                        const dayData = week.find(d => d.date.getDay() === dayOfWeek);
                                        const activity = dayData?.activity;
                                        return (
                                            <div
                                                key={`${weekIndex}-${dayOfWeek}`}
                                                className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-teal-400"
                                                style={{
                                                    backgroundColor: activity ? getColor(activity.intensity) : '#f1f5f9',
                                                }}
                                                onMouseEnter={() => activity && setHoveredDay(activity)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                title={activity
                                                    ? `${activity.date}: ${activity.count} activities, ${activity.minutes} min`
                                                    : dayData ? format(dayData.date, 'MMM dd') : 'No data'}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tooltip */}
                    {hoveredDay && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                            <div className="font-semibold text-slate-800">
                                {format(new Date(hoveredDay.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-slate-600 mt-1">
                                {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'} • {hoveredDay.minutes} min •{' '}
                                <span className="font-medium">{getIntensityLabel(hoveredDay.intensity)}</span>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Less</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(level => (
                                <div
                                    key={level}
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: getColor(level) }}
                                />
                            ))}
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
