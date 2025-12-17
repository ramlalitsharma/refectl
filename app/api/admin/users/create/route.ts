import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { getUserRole, requireSuperAdmin, requireAdmin } from '@/lib/admin-check';
import { canManageRole, getManageableRoles, ROLE_PERMISSIONS } from '@/lib/role-hierarchy';
import type { UserRole } from '@/lib/role-hierarchy';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const managerRole = await getUserRole();
    if (!managerRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, firstName, lastName, role, password } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['superadmin', 'admin', 'teacher', 'student'];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if manager can create this role
    if (!canManageRole(managerRole, role as UserRole)) {
      return NextResponse.json(
        { error: `You don't have permission to create ${role} users` },
        { status: 403 }
      );
    }

    // Superadmin can create admin, teachers, and students
    // Admin can only create teachers
    const manageableRoles = getManageableRoles(managerRole);
    if (!manageableRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `You can only create: ${manageableRoles.join(', ')}` },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const client = await clerkClient();

    // Create user in Clerk
    let clerkUser;
    try {
      clerkUser = await client.users.createUser({
        emailAddress: [email],
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        password: password || undefined,
        skipPasswordChecks: !password, // If no password, user will set it via email
        skipPasswordRequirement: !password,
      });
    } catch (clerkError: any) {
      return NextResponse.json(
        { error: 'Failed to create user in Clerk', message: clerkError.message },
        { status: 500 }
      );
    }

    // Create user in MongoDB
    const userData: any = {
      clerkId: clerkUser.id,
      email: email.toLowerCase(),
      name: `${firstName || ''} ${lastName || ''}`.trim() || email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: role as UserRole,
      isSuperAdmin: role === 'superadmin',
      isAdmin: role === 'admin' || role === 'superadmin',
      isTeacher: role === 'teacher' || role === 'admin' || role === 'superadmin',
      permissions: ROLE_PERMISSIONS[role as UserRole] || [],
      subscriptionTier: 'free' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };

    // Add student-specific fields if creating a student
    if (role === 'student') {
      userData.learningProgress = {
        totalQuizzesTaken: 0,
        averageScore: 0,
        masteryLevel: 0,
        knowledgeGaps: [],
      };
      userData.preferences = {
        difficultyPreference: 'adaptive',
        language: 'en',
      };
    }

    await db.collection('users').insertOne(userData);

    // Update Clerk metadata
    try {
      await client.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          role: role,
          isSuperAdmin: role === 'superadmin',
          isAdmin: role === 'admin' || role === 'superadmin',
          isTeacher: role === 'teacher' || role === 'admin' || role === 'superadmin',
        },
      });
    } catch (metadataError) {
      console.warn('Could not update Clerk metadata:', metadataError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: clerkUser.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', message: error.message },
      { status: 500 }
    );
  }
}

