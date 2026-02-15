import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { UserRole } from '@/lib/navigation-config';
import { ROLE_PERMISSIONS } from '@/lib/role-hierarchy';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { role } = await req.json();

        // RESTRICTION: Users can only choose 'student' or 'user' themselves.
        if (!['student', 'user'].includes(role)) {
            return NextResponse.json({ error: 'Prohibited role selection' }, { status: 403 });
        }

        const client = await clerkClient();

        // Update Clerk Metadata first
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: role,
            },
        });

        // Sync with MongoDB
        const db = await getDatabase();
        await db.collection('users').updateOne(
            { clerkId: userId },
            {
                $set: {
                    role: role,
                    permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [],
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, role });
    } catch (error: any) {
        console.error('Role update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
