import { auth } from './auth';
import { getDatabase } from './mongodb';

export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      $or: [
        { clerkId: userId },
        { _id: userId }
      ]
    });

    return user?.isAdmin === true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Admin access required');
  }
  return true;
}

