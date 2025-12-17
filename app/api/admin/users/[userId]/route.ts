import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin, getUserRole, requireSuperAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

function normalizeUserQuery(userId: string) {
  if (ObjectId.isValid(userId)) {
    return { $or: [{ _id: new ObjectId(userId) }, { clerkId: userId }] };
  }
  return { clerkId: userId };
}

function mapRoleIds(roleIds: any[]): ObjectId[] {
  return roleIds
    .map((id) => {
      if (id instanceof ObjectId) return id;
      if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
      return null;
    })
    .filter((id): id is ObjectId => Boolean(id));
}

// GET - Get user by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { userId } = await params;
    const db = await getDatabase();

    const user = await db.collection('users').findOne(normalizeUserQuery(userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    delete (user as any).password;
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch user', message: e.message }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { userId } = await params;
    const body = await req.json();
    const { name, email, subscriptionStatus, isAdmin, isBanned, roleIds } = body;

    const db = await getDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (Array.isArray(roleIds)) {
      updateData.roleIds = mapRoleIds(roleIds);
    }

    const query = normalizeUserQuery(userId);
    const result = await db.collection('users').updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update user', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete user (hard delete for superadmin, soft delete for admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const managerRole = await getUserRole();
    if (!managerRole) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await params;
    const db = await getDatabase();
    const query = normalizeUserQuery(userId);

    // Get the target user to check their role
    const targetUser = await db.collection('users').findOne(query);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetRole = (targetUser as any).role || 'student';

    // Only superadmin can delete users
    if (managerRole !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmin can delete users' }, { status: 403 });
    }

    // Prevent deleting other superadmins
    if (targetRole === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin users' }, { status: 403 });
    }

    // Prevent deleting yourself
    if (targetUser.clerkId === currentUserId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    const client = await clerkClient();

    // Hard delete: Remove from MongoDB and Clerk
    try {
      // Delete from Clerk
      try {
        await client.users.deleteUser(targetUser.clerkId);
      } catch (clerkError: any) {
        console.warn('Failed to delete user from Clerk:', clerkError.message);
        // Continue with MongoDB deletion even if Clerk deletion fails
      }

      // Delete from MongoDB
      const result = await db.collection('users').deleteOne(query);

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }

      // Also clean up related data (optional - you may want to keep enrollments, progress, etc.)
      // Uncomment if you want to delete related data:
      // await db.collection('enrollments').deleteMany({ userId: targetUser.clerkId });
      // await db.collection('userProgress').deleteMany({ userId: targetUser.clerkId });

      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (deleteError: any) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user', message: deleteError.message },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete user', message: e.message }, { status: 500 });
  }
}

