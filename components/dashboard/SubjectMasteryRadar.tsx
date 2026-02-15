'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle, BookOpen } from 'lucide-react';

interface SubjectData {
    subject: string;
    mastery: number;
    consistency: number;
    timeSpent: number;
    quizzesTaken: number;
    level: string;
}

interface MasteryData {
    chartData: SubjectData[];
    stats: {
        overallAverage: number;
        totalSubjects: number;
        strongestSubject: string | null;
        weakestSubject: string | null;
        strongestScore: number;
        weakestScore: number;
    };
}

interface SubjectMasteryRadarProps {
    className?: string;
}

export function SubjectMasteryRadar(_props: SubjectMasteryRadarProps = {}) {
    const [data, setData] = useState<MasteryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMastery();
    }, []);

    const fetchMastery = async () => {
        try {
            const res = await fetch('/api/analytics/subject-mastery');
            if (!res.ok) throw new Error('Failed to fetch subject mastery');

            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error fetching mastery:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-64 bg-white/5 rounded-[2rem]" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-500">Cognitive Mapping Failed</div>
            </div>
        );
    }

    if (!data || data.chartData.length === 0) {
        return (
            <div className="p-12 text-center bg-white/5 border border-white/5 rounded-[2rem]">
                <div className="flex justify-center mb-4">
                    <BookOpen className="h-9 w-9 text-slate-400" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Blueprint Empty</div>
            </div>
        );
    }

    const stats = data.stats;

    // Prepare radar chart data with max 6 subjects for readability
    const radarData = data.chartData.slice(0, 6).map(d => ({
        subject: d.subject.length > 10 ? d.subject.substring(0, 10).toUpperCase() : d.subject.toUpperCase(),
        mastery: d.mastery,
        fullMark: 100,
    }));

    return (
        <div className="space-y-8">
            <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Neural Mastery"
                            dataKey="mastery"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fill="#06b6d4"
                            fillOpacity={0.15}
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
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid gap-3">
                {data.chartData.slice(0, 4).map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-elite-accent-cyan/20 transition-all group"
                    >
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-elite-accent-cyan transition-colors">{item.subject}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                {item.quizzesTaken} Neural Cycles
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-white font-mono">{item.mastery}%</div>
                            <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Verified</div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.strongestSubject && (
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-elite-accent-cyan/5 border border-elite-accent-cyan/10">
                        <div className="text-[8px] font-black text-elite-accent-cyan uppercase tracking-widest mb-1">Peak Domain</div>
                        <div className="text-[10px] font-black text-white uppercase truncate">{stats.strongestSubject}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-elite-accent-purple/5 border border-elite-accent-purple/10">
                        <div className="text-[8px] font-black text-elite-accent-purple uppercase tracking-widest mb-1">Target Delta</div>
                        <div className="text-[10px] font-black text-white uppercase truncate">{stats.weakestSubject || 'N/A'}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
