'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, LineChart as LineChartIcon } from 'lucide-react';

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

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-64 bg-white/5 rounded-[2rem]" />
                <div className="h-10 bg-white/5 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Flux Telemetry Failed</div>
            </div>
        );
    }

    if (!data || data.chartData.length === 0) {
        return (
            <div className="p-12 text-center bg-white/5 border border-white/5 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <LineChartIcon className="h-9 w-9 text-slate-400" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">No Assessment Data</div>
            </div>
        );
    }

    const stats = data.stats;
    const trendColor = stats.trend === 'improving' ? 'text-elite-accent-emerald' : stats.trend === 'declining' ? 'text-red-500' : 'text-slate-500';
    const trendIcon = stats.trend === 'improving' ? '↑' : stats.trend === 'declining' ? '↓' : '→';

    const chartData = data.chartData.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
    }));

    return (
        <div className="space-y-8">
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.4)"
                            style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.1em' }}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.4)"
                            style={{ fontSize: '8px', fontWeight: 900 }}
                            domain={[0, 100]}
                            width={25}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0b1120',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontSize: '10px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#06b6d4', fontWeight: 900, textTransform: 'uppercase' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4, stroke: '#0b1120' }}
                            activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#fff' }}
                            name="INTEL SCORE"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Stability Trend</div>
                    <div className={`text-[10px] font-black uppercase ${trendColor}`}>
                        {trendIcon} {Math.abs(stats.trendPercentage)}% {stats.trend}
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Mean Accuracy</div>
                    <div className="text-[10px] font-black text-white uppercase">{stats.averageScore}%</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Peak Result</div>
                    <div className="text-[10px] font-black text-elite-accent-emerald uppercase">{stats.highestScore}%</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sync count</div>
                    <div className="text-[10px] font-black text-white uppercase">{stats.totalQuizzes} Cycles</div>
                </div>
            </div>
        </div>
    );
}
