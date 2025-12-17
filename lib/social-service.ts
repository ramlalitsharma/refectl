// Social Service - Utility functions for social features

import { getDatabase } from './mongodb';
import {
    Friendship,
    Friend,
    FRIENDSHIPS_COLLECTION,
} from './models/Friendship';
import {
    ActivityFeedItem,
    CreateActivityInput,
    ACTIVITY_FEED_COLLECTION,
} from './models/ActivityFeed';

/**
 * Get user's public profile with stats
 */
export async function getUserProfile(userId: string, viewerId?: string) {
    const db = await getDatabase();

    // Get user basic info
    const user = await db.collection('users').findOne({ userId });
    if (!user) throw new Error('User not found');

    // Get user stats
    const userStats = await db.collection('userStats').findOne({ userId });
    const badgeCount = await db.collection('userBadges').countDocuments({ userId, earned: true });
    const achievementCount = await db.collection('userAchievements').countDocuments({ userId, unlocked: true });
    const quizCount = await db.collection('studyActivities').countDocuments({ userId, activityType: 'quiz' });
    const courseCount = await db.collection('userProgress').countDocuments({ userId, completed: true });
    const friendCount = await db.collection(FRIENDSHIPS_COLLECTION).countDocuments({
        $or: [{ userId, status: 'accepted' }, { friendId: userId, status: 'accepted' }]
    });

    // Check friendship status if viewer provided
    let friendshipStatus = 'none';
    let isFriend = false;

    if (viewerId && viewerId !== userId) {
        const friendship = await db.collection(FRIENDSHIPS_COLLECTION).findOne({
            $or: [
                { userId: viewerId, friendId: userId },
                { userId: userId, friendId: viewerId },
            ],
        });

        if (friendship) {
            if (friendship.status === 'accepted') {
                friendshipStatus = 'accepted';
                isFriend = true;
            } else if (friendship.userId === viewerId) {
                friendshipStatus = 'pending_sent';
            } else {
                friendshipStatus = 'pending_received';
            }
        }
    }

    return {
        user: {
            userId: user.userId,
            name: user.name || 'Anonymous',
            avatar: user.avatar,
            bio: user.bio,
            friendCount,
            createdAt: user.createdAt,
        },
        stats: {
            level: userStats?.currentLevel || 1,
            xp: userStats?.currentXP || 0,
            currentStreak: userStats?.currentStreak || 0,
            longestStreak: userStats?.longestStreak || 0,
            badgesEarned: badgeCount,
            achievementsUnlocked: achievementCount,
            quizzesCompleted: quizCount,
            coursesCompleted: courseCount,
        },
        isFriend,
        friendshipStatus,
    };
}

/**
 * Get user's friends list
 */
export async function getFriends(userId: string, status?: 'accepted' | 'pending'): Promise<{ friends: Friend[]; counts: any }> {
    const db = await getDatabase();
    const friendCol = db.collection<Friendship>(FRIENDSHIPS_COLLECTION);

    const query: any = {
        $or: [{ userId }, { friendId: userId }],
    };

    if (status) {
        query.status = status;
    }

    const friendships = await friendCol.find(query).toArray();

    const friends: Friend[] = [];

    for (const friendship of friendships) {
        const friendUserId = friendship.userId === userId ? friendship.friendId : friendship.userId;
        const friendUser = await db.collection('users').findOne({ userId: friendUserId });
        const friendStats = await db.collection('userStats').findOne({ userId: friendUserId });

        if (friendUser) {
            friends.push({
                userId: friendUser.userId,
                name: friendUser.name || 'Anonymous',
                avatar: friendUser.avatar,
                level: friendStats?.currentLevel || 1,
                currentXP: friendStats?.currentXP || 0,
                status: friendship.status,
                since: friendship.acceptedAt || friendship.createdAt,
            });
        }
    }

    const accepted = friends.filter(f => f.status === 'accepted').length;
    const pending = friends.filter(f => f.status === 'pending').length;

    return {
        friends,
        counts: {
            total: friends.length,
            accepted,
            pending,
        },
    };
}

/**
 * Send friend request
 */
export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friendship> {
    const db = await getDatabase();
    const friendCol = db.collection<Friendship>(FRIENDSHIPS_COLLECTION);

    // Check if friendship already exists
    const existing = await friendCol.findOne({
        $or: [
            { userId: fromUserId, friendId: toUserId },
            { userId: toUserId, friendId: fromUserId },
        ],
    });

    if (existing) {
        throw new Error('Friendship already exists');
    }

    const friendship: Friendship = {
        userId: fromUserId,
        friendId: toUserId,
        status: 'pending',
        initiatedBy: fromUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await friendCol.insertOne(friendship);

    return friendship;
}

/**
 * Accept or reject friend request
 */
export async function handleFriendRequest(
    userId: string,
    friendUserId: string,
    action: 'accept' | 'reject'
): Promise<Friendship | null> {
    const db = await getDatabase();
    const friendCol = db.collection<Friendship>(FRIENDSHIPS_COLLECTION);

    const friendship = await friendCol.findOne({
        userId: friendUserId,
        friendId: userId,
        status: 'pending',
    });

    if (!friendship) {
        throw new Error('Friend request not found');
    }

    if (action === 'accept') {
        await friendCol.updateOne(
            { _id: friendship._id },
            {
                $set: {
                    status: 'accepted',
                    acceptedAt: new Date(),
                    updatedAt: new Date(),
                },
            }
        );

        return { ...friendship, status: 'accepted', acceptedAt: new Date() };
    } else {
        await friendCol.updateOne(
            { _id: friendship._id },
            {
                $set: {
                    status: 'rejected',
                    updatedAt: new Date(),
                },
            }
        );

        return null;
    }
}

/**
 * Create activity feed item
 */
export async function createActivity(input: CreateActivityInput): Promise<ActivityFeedItem> {
    const db = await getDatabase();
    const activityCol = db.collection<ActivityFeedItem>(ACTIVITY_FEED_COLLECTION);

    // Get user info for denormalization
    const user = await db.collection('users').findOne({ userId: input.userId });

    const activity: ActivityFeedItem = {
        userId: input.userId,
        userName: user?.name || 'Anonymous',
        userAvatar: user?.avatar,
        activityType: input.activityType,
        title: input.title,
        description: input.description,
        icon: input.icon || getDefaultIcon(input.activityType),
        metadata: input.metadata,
        visibility: input.visibility || 'friends',
        createdAt: new Date(),
    };

    await activityCol.insertOne(activity);

    return activity;
}

/**
 * Get activity feed
 */
export async function getActivityFeed(
    scope: 'global' | 'friends' | 'user',
    userId?: string,
    limit: number = 20
): Promise<ActivityFeedItem[]> {
    const db = await getDatabase();
    const activityCol = db.collection<ActivityFeedItem>(ACTIVITY_FEED_COLLECTION);

    let query: any = {};

    if (scope === 'global') {
        query.visibility = 'public';
    } else if (scope === 'user' && userId) {
        query.userId = userId;
    } else if (scope === 'friends' && userId) {
        // Get user's friends
        const friendCol = db.collection<Friendship>(FRIENDSHIPS_COLLECTION);
        const friendships = await friendCol.find({
            $or: [{ userId, status: 'accepted' }, { friendId: userId, status: 'accepted' }],
        }).toArray();

        const friendIds = friendships.map(f =>
            f.userId === userId ? f.friendId : f.userId
        );

        query = {
            $or: [
                { userId: { $in: friendIds }, visibility: { $in: ['public', 'friends'] } },
                { userId, visibility: { $in: ['public', 'friends', 'private'] } },
            ],
        };
    }

    const activities = await activityCol
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

    return activities;
}

/**
 * Compare stats with friend
 */
export async function compareWithFriend(userId: string, friendId: string) {
    const userProfile = await getUserProfile(userId);
    const friendProfile = await getUserProfile(friendId);

    return {
        user: {
            userId,
            name: userProfile.user.name,
            stats: userProfile.stats,
        },
        friend: {
            userId: friendId,
            name: friendProfile.user.name,
            stats: friendProfile.stats,
        },
        comparison: {
            levelDiff: userProfile.stats.level - friendProfile.stats.level,
            xpDiff: userProfile.stats.xp - friendProfile.stats.xp,
            streakDiff: userProfile.stats.currentStreak - friendProfile.stats.currentStreak,
            badgesDiff: userProfile.stats.badgesEarned - friendProfile.stats.badgesEarned,
        },
    };
}

function getDefaultIcon(activityType: string): string {
    const icons: Record<string, string> = {
        level_up: '🎊',
        badge_earned: '🎖️',
        achievement: '🌟',
        streak_milestone: '🔥',
        quiz_perfect: '💯',
        course_completed: '📚',
    };
    return icons[activityType] || '✨';
}
