// Study Activity Model - Logs all user study activities for analytics

import { ObjectId } from 'mongodb';

export interface StudyActivity {
    _id?: ObjectId;
    userId: string;
    date: string;                // YYYY-MM-DD
    activityType: 'quiz' | 'video' | 'reading' | 'course' | 'live' | 'exam';
    minutes: number;
    score: number | null;        // For quizzes/exams
    subject: string | null;
    courseId: string | null;
    lessonId: string | null;
    metadata: {
        difficulty?: 'easy' | 'medium' | 'hard';
        questionsTotal?: number;
        questionsCorrect?: number;
        timeSpent?: number;        // Seconds
        [key: string]: any;
    };
    createdAt: Date;
}

export function createStudyActivity(
    userId: string,
    activityType: StudyActivity['activityType'],
    data: Partial<Omit<StudyActivity, '_id' | 'userId' | 'date' | 'activityType' | 'createdAt'>>
): StudyActivity {
    const now = new Date();
    return {
        userId,
        date: now.toISOString().split('T')[0],
        activityType,
        minutes: data.minutes || 0,
        score: data.score || null,
        subject: data.subject || null,
        courseId: data.courseId || null,
        lessonId: data.lessonId || null,
        metadata: data.metadata || {},
        createdAt: now,
    };
}
