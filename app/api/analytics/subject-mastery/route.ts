// GET /api/analytics/subject-mastery - Get subject performance breakdown

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

        const db = await getDatabase();
        const collection = db.collection<StudyActivity>('studyActivities');

        // Get all quiz activities with subjects and scores
        const activities = await collection
            .find({
                userId,
                activityType: 'quiz',
                subject: { $ne: null },
                score: { $ne: null },
            })
            .toArray();

        // Group by subject
        const subjectData: Record<string, { scores: number[]; time: number; quizzes: number }> = {};

        activities.forEach(activity => {
            const subject = activity.subject || 'Other';
            if (!subjectData[subject]) {
                subjectData[subject] = { scores: [], time: 0, quizzes: 0 };
            }
            subjectData[subject].scores.push(activity.score || 0);
            subjectData[subject].time += activity.minutes;
            subjectData[subject].quizzes += 1;
        });

        // Convert to radar chart format
        const radarData = Object.entries(subjectData)
            .map(([subject, data]) => {
                const avgScore = Math.round(
                    data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
                );
                const consistency = calculateConsistency(data.scores);

                return {
                    subject,
                    mastery: avgScore,
                    consistency,
                    timeSpent: data.time,
                    quizzesTaken: data.quizzes,
                    level: getMasteryLevel(avgScore, consistency),
                };
            })
            .sort((a, b) => b.mastery - a.mastery);

        // If no subjects, return default subjects with 0 data
        const chartData = radarData.length > 0 ? radarData : getDefaultSubjects();

        // Calculate overall stats
        const overallAverage = radarData.length > 0
            ? Math.round(radarData.reduce((sum, s) => sum + s.mastery, 0) / radarData.length)
            : 0;

        const strongestSubject = radarData.length > 0 ? radarData[0] : null;
        const weakestSubject = radarData.length > 0 ? radarData[radarData.length - 1] : null;

        return NextResponse.json({
            success: true,
            data: {
                chartData,
                stats: {
                    overallAverage,
                    totalSubjects: radarData.length,
                    strongestSubject: strongestSubject?.subject || null,
                    weakestSubject: weakestSubject?.subject || null,
                    strongestScore: strongestSubject?.mastery || 0,
                    weakestScore: weakestSubject?.mastery || 0,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching subject mastery:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Calculate consistency (lower standard deviation = more consistent)
function calculateConsistency(scores: number[]): number {
    if (scores.length < 2) return 100;

    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Convert to 0-100 scale (lower std dev = higher consistency)
    return Math.max(0, Math.round(100 - stdDev));
}

// Determine mastery level
function getMasteryLevel(avgScore: number, consistency: number): string {
    const combined = (avgScore + consistency) / 2;
    if (combined >= 85) return 'Expert';
    if (combined >= 70) return 'Advanced';
    if (combined >= 55) return 'Intermediate';
    return 'Beginner';
}

// Default subjects for empty state
function getDefaultSubjects() {
    return [
        { subject: 'Mathematics', mastery: 0, consistency: 0, timeSpent: 0, quizzesTaken: 0, level: 'Beginner' },
        { subject: 'Science', mastery: 0, consistency: 0, timeSpent: 0, quizzesTaken: 0, level: 'Beginner' },
        { subject: 'English', mastery: 0, consistency: 0, timeSpent: 0, quizzesTaken: 0, level: 'Beginner' },
        { subject: 'History', mastery: 0, consistency: 0, timeSpent: 0, quizzesTaken: 0, level: 'Beginner' },
    ];
}
