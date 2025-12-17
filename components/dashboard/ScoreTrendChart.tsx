'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScoreTrendData {
    chartData: Array<{
        date: string;
        score: number;
        quizzes: number;
    }>;
    stats: {
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        totalQuizzes: number;
        trend: 'improving' | 'declining' | 'stable';
        trendPercentage: number;
    };
}

interface ScoreTrendProps {
    days?: number;
}

export function ScoreTrendChart({ days = 30 }: ScoreTrendProps = {}) {
    const [data, setData] = useState<ScoreTrendData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchScoreTrend();
    }, [days]);

    const fetchScoreTrend = async () => {
        try {
            const res = await fetch(`/api/analytics/score-trend?days=${days}`);
            if (res.status === 401) { setLoading(false); return; }
            if (!res.ok) throw new Error('Failed to fetch score trend');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching score trend:', err);
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
                        📈 Score Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />
                    <div className="mt-4 h-6 bg-slate-100 rounded animate-pulse" />
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
                        <div className="text-sm font-medium text-red-600">Failed to load score trend</div>
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
                        📈 Score Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items center justify-center text-slate-400">
                        <div className="text-center space-y-2">
                            <div className="text-4xl">📊</div>
                            <div className="text-sm">No quiz data yet</div>
                            <div className="text-xs">Complete quizzes to see your progress</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const stats = data.stats;
    const trendColor = stats.trend === 'improving' ? 'text-green-600' : stats.trend === 'declining' ? 'text-red-600' : 'text-slate-600';
    const trendIcon = stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→';

    // Format dates for display (show only month-day)
    const chartData = data.chartData.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                    <span>📈 Score Trend</span>
                    <span className="text-sm font-normal text-slate-500 normal-case">
                        Last {days} days
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[500px] md:min-w-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    style={{ fontSize: '12px' }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    style={{ fontSize: '12px' }}
                                    domain={[0, 100]}
                                    width={30}
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
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    dot={{ fill: '#14b8a6', r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="Quiz Score (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stats.trend === 'improving' ? 'bg-green-500' : stats.trend === 'declining' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                        <span className="text-slate-600 text-sm">
                            Trend: <span className={`font-semibold ${trendColor}`}>
                                {trendIcon} {Math.abs(stats.trendPercentage)}% {stats.trend}
                            </span>
                        </span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        Average: <span className="font-semibold text-slate-700">{stats.averageScore}%</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        Highest: <span className="font-semibold text-green-600">{stats.highestScore}%</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        Total Quizzes: <span className="font-semibold text-slate-700">{stats.totalQuizzes}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
