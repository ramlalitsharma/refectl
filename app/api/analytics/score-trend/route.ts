// GET /api/analytics/score-trend - Get quiz score trend over time

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { StudyActivity } from '@/lib/models/StudyActivity';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30'); // Default last 30 days

        const db = await getDatabase();
        const collection = db.collection<StudyActivity>('studyActivities');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get quiz activities with scores
        const activities = await collection
            .find({
                userId,
                activityType: 'quiz',
                score: { $ne: null },
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .sort({ createdAt: 1 })
            .toArray();

        // Group by date and calculate average score per day
        const scoresByDate: Record<string, { total: number; count: number }> = {};

        activities.forEach(activity => {
            const date = activity.date;
            if (!scoresByDate[date]) {
                scoresByDate[date] = { total: 0, count: 0 };
            }
            scoresByDate[date].total += activity.score || 0;
            scoresByDate[date].count += 1;
        });

        // Convert to chart data format
        const chartData = Object.entries(scoresByDate)
            .map(([date, data]) => ({
                date,
                score: Math.round(data.total / data.count),
                quizzes: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Calculate stats
        const allScores = activities.map(a => a.score || 0);
        const averageScore = allScores.length > 0
            ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
            : 0;

        const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
        const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;

        // Calculate trend
        const recentScores = chartData.slice(-7).map(d => d.score);
        const olderScores = chartData.slice(0, Math.min(7, chartData.length - 7)).map(d => d.score);

        const recentAvg = recentScores.length > 0
            ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
            : 0;
        const olderAvg = olderScores.length > 0
            ? olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
            : 0;

        const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

        return NextResponse.json({
            success: true,
            data: {
                chartData,
                stats: {
                    averageScore,
                    highestScore,
                    lowestScore,
                    totalQuizzes: activities.length,
                    trend,
                    trendPercentage: olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching score trend:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
