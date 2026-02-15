'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, BookOpen } from 'lucide-react';

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

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-2xl" />
                    ))}
                </div>
                <div className="h-64 bg-white/5 rounded-[2rem]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Flow Telemetry Error</div>
            </div>
        );
    }

    if (!data || data.chartData.length === 0) {
        return (
            <div className="p-12 text-center bg-white/5 border border-white/5 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <BookOpen className="h-9 w-9 text-slate-400" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">No Temporal Data</div>
            </div>
        );
    }

    const stats = data.stats;
    const totalHours = Math.floor(stats.totalMinutes / 60);
    const remainingMinutes = stats.totalMinutes % 60;

    const chartData = data.chartData.map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
    }));

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-cyan/20 transition-all">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Temporal Sum</div>
                    <div className="text-xl font-black text-white">{totalHours}H {remainingMinutes}M</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-emerald/20 transition-all">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Mean Delta</div>
                    <div className="text-xl font-black text-white">{stats.averagePerDay}M</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-elite-accent-purple/20 transition-all">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pulse Sync</div>
                    <div className="text-xl font-black text-white">{stats.consistency}%</div>
                </div>
            </div>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.4)"
                            style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.1em' }}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.4)"
                            style={{ fontSize: '7px', fontWeight: 900 }}
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
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar dataKey="quiz" stackId="a" fill="rgba(6, 182, 212, 0.8)" name="SYNC" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="video" stackId="a" fill="rgba(168, 85, 247, 0.8)" name="FLOW" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="reading" stackId="a" fill="rgba(16, 185, 129, 0.8)" name="READ" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="other" stackId="a" fill="rgba(255, 255, 255, 0.1)" name="MISC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {stats.daysStudied} / {stats.totalDays} Assessment Cycles <span className="text-slate-700 px-2">•</span> Peak Burst: {stats.longestSession}m
                </div>
            </div>
        </div>
    );
}
