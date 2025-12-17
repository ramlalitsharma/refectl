'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StudyTimeData {
    chartData: Array<{
        date: string;
        minutes: number;
        quiz: number;
        video: number;
        reading: number;
        other: number;
    }>;
    stats: {
        totalMinutes: number;
        totalHours: number;
        averagePerDay: number;
        longestSession: number;
        daysStudied: number;
        totalDays: number;
        consistency: number;
    };
    byType: Record<string, number>;
}

interface StudyTimeChartProps {
    days?: number;
}

export function StudyTimeChart({ days = 14 }: StudyTimeChartProps = {}) {
    const [data, setData] = useState<StudyTimeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudyTime();
    }, [days]);

    const fetchStudyTime = async () => {
        try {
            const res = await fetch(`/api/analytics/study-time?days=${days}`);
            if (res.status === 401) { setLoading(false); return; }
            if (!res.ok) throw new Error('Failed to fetch study time');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching study time:', err);
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
                        ⏱️ Study Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                    <div className="h-[250px] bg-slate-100 rounded-lg animate-pulse" />
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
                        <div className="text-sm font-medium text-red-600">Failed to load study time</div>
                        <div className="text-xs text-red-500">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!data || data.chartData.length === 0) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        ⏱️ Study Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] flex items-center justify-center text-slate-400">
                        <div className="text-center space-y-2">
                            <div className="text-4xl">📚</div>
                            <div className="text-sm">No study activity yet</div>
                            <div className="text-xs">Start studying to track your time</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const stats = data.stats;
    const totalHours = Math.floor(stats.totalMinutes / 60);
    const remainingMinutes = stats.totalMinutes % 60;

    // Format dates for display
    const chartData = data.chartData.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                    ⏱️ Study Time - Last {days} Days
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {totalHours}h {remainingMinutes}m
                        </div>
                        <div className="text-xs text-blue-700 mt-1">Total Time</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{stats.averagePerDay}m</div>
                        <div className="text-xs text-green-700 mt-1">Daily Average</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{stats.consistency}%</div>
                        <div className="text-xs text-purple-700 mt-1">Consistency</div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="min-w-[500px] md:min-w-0">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    style={{ fontSize: '11px' }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    style={{ fontSize: '12px' }}
                                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                                    width={40}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="quiz" stackId="a" fill="#3b82f6" name="Quiz" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="video" stackId="a" fill="#10b981" name="Video" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="reading" stackId="a" fill="#8b5cf6" name="Reading" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="other" stackId="a" fill="#f59e0b" name="Other" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-4 text-sm text-slate-600 text-center">
                    {stats.daysStudied}/{stats.totalDays} active days • Longest session: {stats.longestSession} min
                </div>
            </CardContent>
        </Card>
    );
}
