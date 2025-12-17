
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Hardcoded data from cms-seed.ts (since we can't easily import TS in a standalone JS script without compilation)
const INITIAL_BADGES = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        rarity: 'common',
        category: 'learning',
        requirementType: 'quizzes_completed',
        requirementValue: 1,
        xpReward: 50,
        order: 1
    },
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        rarity: 'rare',
        category: 'consistency',
        requirementType: 'streak_days',
        requirementValue: 7,
        xpReward: 150,
        order: 2
    },
    {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '💯',
        rarity: 'epic',
        category: 'mastery',
        requirementType: 'perfect_scores',
        requirementValue: 1,
        xpReward: 200,
        order: 3
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 10 quizzes',
        icon: '📚',
        rarity: 'rare',
        category: 'learning',
        requirementType: 'quizzes_completed',
        requirementValue: 10,
        xpReward: 100,
        order: 4
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a lesson before 8 AM',
        icon: '🌅',
        rarity: 'common',
        category: 'consistency',
        requirementType: 'early_morning_lessons',
        requirementValue: 1,
        xpReward: 50,
        order: 5
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a lesson after 10 PM',
        icon: '🦉',
        rarity: 'common',
        category: 'consistency',
        requirementType: 'late_night_lessons',
        requirementValue: 1,
        xpReward: 50,
        order: 6
    },
    {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Archive more than 90% in 5 quizzes',
        icon: '🧠',
        rarity: 'epic',
        category: 'mastery',
        requirementType: 'high_score_count',
        requirementValue: 5,
        xpReward: 300,
        order: 7
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Study for 30 consecutive days',
        icon: '📅',
        rarity: 'legendary',
        category: 'consistency',
        requirementType: 'streak_days',
        requirementValue: 30,
        xpReward: 1000,
        order: 8
    },
    {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Add 5 friends',
        icon: '🦋',
        rarity: 'common',
        category: 'social',
        requirementType: 'friends_added',
        requirementValue: 5,
        xpReward: 100,
        order: 9
    },
    {
        id: 'community_pillar',
        name: 'Community Pillar',
        description: 'Help 10 other students',
        icon: '🏛️',
        rarity: 'epic',
        category: 'social',
        requirementType: 'students_helped',
        requirementValue: 10,
        xpReward: 400,
        order: 10
    }
];

const INITIAL_QUESTS = [
    {
        id: 'daily_quiz',
        title: 'Quiz Master',
        description: 'Complete 1 quiz today',
        type: 'complete_quiz',
        requirementValue: 1,
        xpReward: 50,
        rarity: 'common',
        frequency: 'daily'
    },
    {
        id: 'daily_study_15',
        title: 'Quick Study',
        description: 'Study for 15 minutes',
        type: 'study_time',
        requirementValue: 15,
        xpReward: 30,
        rarity: 'common',
        frequency: 'daily'
    },
    {
        id: 'daily_perfect',
        title: 'Perfectionist',
        description: 'Get a perfect score on a quiz',
        type: 'perfect_score',
        requirementValue: 1,
        xpReward: 100,
        rarity: 'rare',
        frequency: 'daily'
    },
    {
        id: 'daily_read',
        title: 'Reader',
        description: 'Read 2 articles',
        type: 'read_articles',
        requirementValue: 2,
        xpReward: 40,
        rarity: 'common',
        frequency: 'daily'
    },
    {
        id: 'daily_streak_keep',
        title: 'Streak Keeper',
        description: ' Extend your streak today',
        type: 'extend_streak',
        requirementValue: 1,
        xpReward: 60,
        rarity: 'common',
        frequency: 'daily'
    }
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');

    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('lms'); // Explicitly use 'lms' db

        // 1. Seed Badges
        console.log('🌱 Seeding Badges...');
        const badgeCol = db.collection('badgeDefinitions');
        // Clear existing to avoid duplicates if partial seed
        await badgeCol.deleteMany({});
        const badgeDocs = INITIAL_BADGES.map(b => ({
            ...b,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        await badgeCol.insertMany(badgeDocs);
        console.log(`   - Inserted ${badgeDocs.length} badges`);

        // 2. Seed Quests
        console.log('🌱 Seeding Quests...');
        const questCol = db.collection('questTemplates');
        await questCol.deleteMany({});
        const questDocs = INITIAL_QUESTS.map(q => ({
            ...q,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        await questCol.insertMany(questDocs);
        console.log(`   - Inserted ${questDocs.length} quests`);

        console.log('✨ Seeding Complete!');
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await client.close();
    }
}

seed();
