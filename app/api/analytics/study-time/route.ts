// GET /api/analytics/study-time - Get study time by day

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
        const days = parseInt(searchParams.get('days') || '14'); // Default last 14 days

        const db = await getDatabase();
        const collection = db.collection<StudyActivity>('studyActivities');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all study activities
        const activities = await collection
            .find({
                userId,
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .sort({ createdAt: 1 })
            .toArray();

        // Group by date and sum minutes
        const minutesByDate: Record<string, { total: number; byType: Record<string, number> }> = {};

        activities.forEach(activity => {
            const date = activity.date;
            if (!minutesByDate[date]) {
                minutesByDate[date] = { total: 0, byType: {} };
            }
            minutesByDate[date].total += activity.minutes;

            const type = activity.activityType;
            minutesByDate[date].byType[type] = (minutesByDate[date].byType[type] || 0) + activity.minutes;
        });

        // Convert to chart data format
        const chartData = Object.entries(minutesByDate)
            .map(([date, data]) => ({
                date,
                minutes: data.total,
                quiz: data.byType.quiz || 0,
                video: data.byType.video || 0,
                reading: data.byType.reading || 0,
                other: (data.byType.course || 0) + (data.byType.live || 0) + (data.byType.exam || 0),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Calculate stats
        const totalMinutes = activities.reduce((sum, a) => sum + a.minutes, 0);
        const averagePerDay = chartData.length > 0 ? Math.round(totalMinutes / chartData.length) : 0;
        const longestSession = Math.max(...activities.map(a => a.minutes), 0);
        const daysStudied = chartData.length;

        // Activity type breakdown
        const byType: Record<string, number> = {};
        activities.forEach(a => {
            byType[a.activityType] = (byType[a.activityType] || 0) + a.minutes;
        });

        return NextResponse.json({
            success: true,
            data: {
                chartData,
                stats: {
                    totalMinutes,
                    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
                    averagePerDay,
                    longestSession,
                    daysStudied,
                    totalDays: days,
                    consistency: Math.round((daysStudied / days) * 100),
                },
                byType,
            },
        });
    } catch (error) {
        console.error('Error fetching study time:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
