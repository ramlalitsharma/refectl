import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const SubscriptionService = {
    /**
     * Check if a user has premium access
     */
    isPro: async (userId: string): Promise<boolean> => {
        const db = await getDatabase();
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        return user?.subscriptionTier === 'premium' && user?.subscriptionStatus === 'active';
    },

    /**
     * MOCK: Upgrade a user to Pro immediately
     * Used when users click "Upgrade" in the Mock/Demo environment
     */
    mockUpgrade: async (userId: string) => {
        const db = await getDatabase();
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    subscriptionTier: 'premium',
                    subscriptionStatus: 'active',
                    subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                }
            }
        );
        return true;
    },

    /**
     * Get formatted usage limits for the user
     */
    getLimits: async (userId: string) => {
        const isPro = await SubscriptionService.isPro(userId);
        return {
            dailyQuizzes: isPro ? Infinity : 3,
            dailyChatMessages: isPro ? Infinity : 5,
            canAccessAdvancedStats: isPro,
            hasGoldBadge: isPro
        };
    }
};
