// Database Index Setup Script
// Run this to ensure optimal performance for queries

import { getDatabase } from '@/lib/mongodb';

export async function ensureIndexes() {
    const db = await getDatabase();
    console.log('Ensuring DB Indexes...');

    try {
        // 1. Users - Critical indexes
        await db.collection('users').createIndex({ userId: 1 }, { unique: true, background: true });
        await db.collection('users').createIndex({ email: 1 }, { background: true });
        await db.collection('users').createIndex({ clerkId: 1 }, { background: true });
        await db.collection('users').createIndex({ role: 1 }, { background: true });
        await db.collection('users').createIndex({ isBanned: 1 }, { background: true });
        await db.collection('users').createIndex({ createdAt: -1 }, { background: true });
        // Compound index for admin user queries
        await db.collection('users').createIndex({ role: 1, isBanned: 1, createdAt: -1 }, { background: true });

        // 2. UserStats - Critical for Leaderboards
        await db.collection('userStats').createIndex({ currentXP: -1, totalQuizzes: -1 }, { background: true });
        await db.collection('userStats').createIndex({ userId: 1 }, { unique: true, background: true });
        await db.collection('userStats').createIndex({ level: -1 }, { background: true });

        // 3. Activity Feed - Feed Queries
        await db.collection('activityFeed').createIndex({ userId: 1, createdAt: -1 }, { background: true });
        await db.collection('activityFeed').createIndex({ visibility: 1, createdAt: -1 }, { background: true });

        // 4. Study Activities - Analytics
        await db.collection('studyActivities').createIndex({ userId: 1, createdAt: -1 }, { background: true });
        await db.collection('studyActivities').createIndex({ userId: 1, activityType: 1 }, { background: true });
        await db.collection('studyActivities').createIndex({ createdAt: -1 }, { background: true });

        // 5. Daily Quests - Lookup
        await db.collection('dailyQuests').createIndex({ userId: 1, date: 1 }, { unique: true, background: true });

        // 6. Notifications - Polling
        await db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 }, { background: true });
        await db.collection('notifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });

        // 7. Courses - Search and filtering
        await db.collection('courses').createIndex({ slug: 1 }, { unique: true, background: true });
        await db.collection('courses').createIndex({ status: 1, createdAt: -1 }, { background: true });
        await db.collection('courses').createIndex({ subject: 1, status: 1 }, { background: true });
        await db.collection('courses').createIndex({ title: 'text', summary: 'text' }, { background: true });

        // 8. Blogs - Search and filtering
        await db.collection('blogs').createIndex({ slug: 1 }, { unique: true, background: true });
        await db.collection('blogs').createIndex({ status: 1, createdAt: -1 }, { background: true });
        await db.collection('blogs').createIndex({ title: 'text', description: 'text' }, { background: true });

        // 9. Enrollments - User course access
        await db.collection('enrollments').createIndex({ userId: 1, courseId: 1 }, { unique: true, background: true });
        await db.collection('enrollments').createIndex({ userId: 1, status: 1 }, { background: true });
        await db.collection('enrollments').createIndex({ courseId: 1, status: 1 }, { background: true });

        // 10. Rate Limits - TTL for auto-cleanup
        await db.collection('rateLimits').createIndex({ key: 1, createdAt: -1 }, { background: true });
        await db.collection('rateLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });

        // 11. Videos - Lookup and status
        await db.collection('videos').createIndex({ videoId: 1 }, { unique: true, background: true });
        await db.collection('videos').createIndex({ status: 1, createdAt: -1 }, { background: true });

        // 12. Subjects - Lookup
        await db.collection('subjects').createIndex({ slug: 1 }, { unique: true, background: true });
        await db.collection('subjects').createIndex({ category: 1 }, { background: true });

        // 13. Achievements - User achievements
        await db.collection('achievements').createIndex({ userId: 1, achievementId: 1 }, { unique: true, background: true });
        await db.collection('achievements').createIndex({ userId: 1, unlockedAt: -1 }, { background: true });

        // 14. UserBadges - Badge collection
        await db.collection('userBadges').createIndex({ userId: 1, badgeId: 1 }, { unique: true, background: true });
        await db.collection('userBadges').createIndex({ userId: 1, unlockedAt: -1 }, { background: true });

        // 15. Leaderboard History - Historical rankings
        await db.collection('leaderboardHistory').createIndex({ userId: 1, date: -1 }, { background: true });
        await db.collection('leaderboardHistory').createIndex({ date: -1, rank: 1 }, { background: true });

        // 16. Live Rooms - Scheduling and management
        await db.collection('liveRooms').createIndex({ roomId: 1 }, { unique: true, background: true });
        await db.collection('liveRooms').createIndex({ createdBy: 1, createdAt: -1 }, { background: true });
        await db.collection('liveRooms').createIndex({ status: 1, scheduledStartTime: 1 }, { background: true });
        await db.collection('liveRooms').createIndex({ courseId: 1 }, { background: true });
        await db.collection('liveRooms').createIndex({ scheduledStartTime: 1 }, { background: true });

        // 17. Live Class Attendance - Participant tracking
        await db.collection('liveClassAttendance').createIndex({ roomId: 1, userId: 1 }, { background: true });
        await db.collection('liveClassAttendance').createIndex({ roomId: 1, joinedAt: -1 }, { background: true });
        await db.collection('liveClassAttendance').createIndex({ userId: 1, joinedAt: -1 }, { background: true });

        // 18. Live Class Recordings - Recording management
        await db.collection('liveClassRecordings').createIndex({ roomId: 1, createdAt: -1 }, { background: true });
        await db.collection('liveClassRecordings').createIndex({ recordingId: 1 }, { unique: true, background: true });
        await db.collection('liveClassRecordings').createIndex({ status: 1 }, { background: true });

        // 19. Live Class Hand Raises - Q&A queue
        await db.collection('liveClassHandRaises').createIndex({ roomId: 1, status: 1, priority: 1 }, { background: true });
        await db.collection('liveClassHandRaises').createIndex({ roomId: 1, userId: 1, status: 1 }, { background: true });

        // 20. Live Class Polls - Poll management
        await db.collection('liveClassPolls').createIndex({ roomId: 1, status: 1, createdAt: -1 }, { background: true });
        await db.collection('liveClassPolls').createIndex({ roomId: 1, status: 1 }, { background: true });

        // 21. Live Class Student Notes - Student notes
        await db.collection('liveClassStudentNotes').createIndex({ roomId: 1, userId: 1 }, { background: true });
        await db.collection('liveClassStudentNotes').createIndex({ roomId: 1, timestamp: 1 }, { background: true });

        // 22. Live Class Resources - Class resources
        await db.collection('liveClassResources').createIndex({ roomId: 1, order: 1 }, { background: true });

        // 23. Live Class Moderation - Moderation logs
        await db.collection('liveClassModeration').createIndex({ roomId: 1, timestamp: -1 }, { background: true });
        await db.collection('liveClassModeration').createIndex({ moderatorId: 1, timestamp: -1 }, { background: true });

        console.log('✅ All indexes checked/created successfully.');
        return true;
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        // Don't throw - allow app to continue even if index creation fails
        return false;
    }
}
