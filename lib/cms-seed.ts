// Content Migration Script - Seeds DB with initial hardcoded data

import { getDatabase } from '@/lib/mongodb';
import { BADGES_COLLECTION } from './models/BadgeDefinition';
import { QUEST_TEMPLATES_COLLECTION } from './models/QuestTemplate';

// 1. Hardcoded Badges (From existing badge-system.ts)
export const INITIAL_BADGES = [
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

// 2. Hardcoded Sample Quests (From existing quest-system.ts logic)
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

export async function seedContent() {
    const db = await getDatabase();

    // 1. Seed Badges
    const badgeCol = db.collection(BADGES_COLLECTION);
    const existingBadges = await badgeCol.countDocuments();

    if (existingBadges === 0) {
        console.log('Seeding initial badges...');
        const badges = INITIAL_BADGES.map(b => ({
            ...b,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        // @ts-ignore
        await badgeCol.insertMany(badges);
    }

    // 2. Seed Quests
    const questCol = db.collection(QUEST_TEMPLATES_COLLECTION);
    const existingQuests = await questCol.countDocuments();

    if (existingQuests === 0) {
        console.log('Seeding initial quests...');
        const quests = INITIAL_QUESTS.map(q => ({
            ...q,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        // @ts-ignore
        await questCol.insertMany(quests);
    }

    return {
        badgesSeeded: existingBadges === 0,
        questsSeeded: existingQuests === 0
    };
}
