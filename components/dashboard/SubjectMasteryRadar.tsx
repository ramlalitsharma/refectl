'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
    // No props - always fetch real data
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

    // Loading state
    if (loading) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        🎯 Subject Mastery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] bg-slate-100 rounded-lg animate-pulse" />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
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
                        <div className="text-sm font-medium text-red-600">Failed to load subject mastery</div>
                        <div className="text-xs text-red-500">{error}</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.chartData.length === 0) {
        return (
            <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
                <CardHeader>
                    <CardTitle className="text-lg uppercase tracking-wide text-teal-700">
                        🎯 Subject Mastery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] flex items-center justify-center text-slate-400">
                        <div className="text-center space-y-2">
                            <div className="text-4xl">📚</div>
                            <div className="text-sm">No subject data yet</div>
                            <div className="text-xs">Complete quizzes in different subjects</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const stats = data.stats;

    const getGradeColor = (mastery: number) => {
        if (mastery >= 85) return 'text-green-600';
        if (mastery >= 70) return 'text-blue-600';
        if (mastery >= 55) return 'text-orange-600';
        return 'text-red-600';
    };

    const getMasteryLabel = (level: string) => {
        const labels: Record<string, string> = {
            'Expert': '🏆 Expert',
            'Advanced': '🌟 Advanced',
            'Intermediate': '📘 Intermediate',
            'Beginner': '📙 Beginner',
        };
        return labels[level] || level;
    };

    // Prepare radar chart data with max 6 subjects for readability
    const radarData = data.chartData.slice(0, 6).map(d => ({
        subject: d.subject.length > 12 ? d.subject.substring(0, 12) + '...' : d.subject,
        mastery: d.mastery,
        fullMark: 100,
    }));

    return (
        <Card className="shadow-lg border-none backdrop-blur-sm bg-white/90">
            <CardHeader>
                <CardTitle className="text-lg uppercase tracking-wide text-teal-700 flex items-center justify-between">
                    <span>🎯 Subject Mastery</span>
                    <span className={`text-sm font-normal normal-case ${getGradeColor(stats.overallAverage)}`}>
                        Avg: {stats.overallAverage}%
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: '#64748b', fontSize: 10 }}
                            />
                            <Radar
                                name="Mastery %"
                                dataKey="mastery"
                                stroke="#14b8a6"
                                fill="#14b8a6"
                                fillOpacity={0.6}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                formatter={(value: number) => [`${value}%`, 'Mastery']}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Details */}
                <div className="mt-4 space-y-2">
                    {data.chartData.slice(0, 6).map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                        >
                            <div className="flex-1 min-w-0">
                                <span className="text-slate-700 font-medium truncate block">{item.subject}</span>
                                <span className="text-xs text-slate-500">
                                    {item.quizzesTaken} {item.quizzesTaken === 1 ? 'quiz' : 'quizzes'} • {item.timeSpent} min
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${getGradeColor(item.mastery)}`}>
                                    {item.mastery}%
                                </span>
                                <span className="text-xs text-slate-500">{getMasteryLabel(item.level)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Summary */}
                {stats.strongestSubject && (
                    <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                            <div className="font-semibold text-green-700 truncate">{stats.strongestSubject}</div>
                            <div className="text-xs text-green-600">Strongest • {stats.strongestScore}%</div>
                        </div>
                        {stats.weakestSubject && (
                            <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
                                <div className="font-semibold text-orange-700 truncate">{stats.weakestSubject}</div>
                                <div className="text-xs text-orange-600">Focus Area • {stats.weakestScore}%</div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
