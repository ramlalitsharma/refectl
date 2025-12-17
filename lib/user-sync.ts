import { auth, currentUser } from '@clerk/nextjs/server';
import { getDatabase } from './mongodb';
import { User } from './models/User';
import { ROLE_PERMISSIONS } from './role-hierarchy';
import { resolveRoleClaims } from './role-utils';

/**
 * Manually sync user from Clerk to MongoDB
 * This is used for local development when webhooks aren't set up
 * Call this after user signs in to ensure they exist in MongoDB
 */
export async function syncUserToDatabase(): Promise<User | null> {
  // Skip during build to avoid MongoDB connection errors
  if (process.env.SKIP_DB_BUILD === 'true') {
    return null;
  }

  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ clerkId: userId });

    const roleClaims = resolveRoleClaims(
      clerkUser.publicMetadata as Record<string, any>,
      clerkUser.privateMetadata as Record<string, any>,
      { role: (clerkUser as any).organizationMemberships?.[0]?.role }
    );

    const baseUpdates: Partial<User> = {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      updatedAt: new Date(),
    };

    // IMPORTANT:
    // - If Clerk provides explicit role claims, we trust them.
    // - If not, we fall back to the existing MongoDB role so that a
    //   manually-promoted superadmin in the database is not downgraded
    //   back to "student" or "admin" just because Clerk metadata is missing.
    if (roleClaims) {
      baseUpdates.role = roleClaims.role;
      baseUpdates.isSuperAdmin = roleClaims.isSuperAdmin;
      baseUpdates.isAdmin = roleClaims.isAdmin;
      baseUpdates.isTeacher = roleClaims.isTeacher;
      baseUpdates.permissions = ROLE_PERMISSIONS[roleClaims.role] || [];
    } else if (existingUser) {
      baseUpdates.role = existingUser.role;
      baseUpdates.isSuperAdmin = existingUser.isSuperAdmin === true;
      baseUpdates.isAdmin = existingUser.isAdmin === true || existingUser.isSuperAdmin === true;
      baseUpdates.isTeacher =
        existingUser.isTeacher === true || baseUpdates.isAdmin === true;
      const roleKey: 'student' | 'teacher' | 'admin' | 'superadmin' =
        existingUser.role === 'student' || existingUser.role === 'teacher' || existingUser.role === 'admin' || existingUser.role === 'superadmin'
          ? (existingUser.role as any)
          : 'student';
      baseUpdates.permissions = Array.isArray(existingUser.permissions)
        ? existingUser.permissions
        : ROLE_PERMISSIONS[roleKey] || [];
    }

    if (existingUser) {
      // Update user info if needed
      await usersCollection.updateOne({ clerkId: userId }, { $set: baseUpdates });
      return { ...existingUser, ...baseUpdates };
    }

    // Create new user
    const now = new Date();
    const newUser: User = {
      clerkId: userId,
      email: baseUpdates.email || '',
      name: baseUpdates.name || '',
      role: roleClaims?.role || 'student',
      isSuperAdmin: roleClaims?.isSuperAdmin || false,
      isAdmin: roleClaims?.isAdmin || false,
      isTeacher: roleClaims?.isTeacher || false,
      permissions: roleClaims ? ROLE_PERMISSIONS[roleClaims.role] || [] : [],
      subscriptionTier: (clerkUser.publicMetadata?.subscriptionTier as 'free' | 'premium') || 'free',
      subscriptionStatus: clerkUser.publicMetadata?.subscriptionStatus as
        | 'active'
        | 'trialing'
        | 'canceled'
        | 'past_due'
        | undefined,
      subscriptionCurrentPeriodEnd: clerkUser.publicMetadata?.subscriptionCurrentPeriodEnd
        ? new Date(clerkUser.publicMetadata.subscriptionCurrentPeriodEnd as string)
        : undefined,
      createdAt: now,
      updatedAt: now,
      learningProgress: {
        totalQuizzesTaken: 0,
        averageScore: 0,
        masteryLevel: 0,
        knowledgeGaps: [],
      },
      preferences: {
        difficultyPreference: 'adaptive',
        language: 'en',
      },
    };

    await usersCollection.insertOne(newUser);
    return newUser;
  } catch (error) {
    console.error('Error syncing user to database:', error);
    return null;
  }
}
