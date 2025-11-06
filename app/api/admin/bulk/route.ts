import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { action, type, ids } = body; // action: publish, unpublish, delete | type: courses, blogs

    if (!action || !type || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = type === 'courses' ? 'courses' : 'blogs';
    const objectIds = ids.map((id: string) => {
      try {
        return { _id: id };
      } catch {
        return { slug: id };
      }
    });

    let result;
    switch (action) {
      case 'publish':
        result = await db.collection(collection).updateMany(
          { $or: objectIds },
          { $set: { status: 'published', updatedAt: new Date() } }
        );
        break;
      case 'unpublish':
        result = await db.collection(collection).updateMany(
          { $or: objectIds },
          { $set: { status: 'draft', updatedAt: new Date() } }
        );
        break;
      case 'delete':
        result = await db.collection(collection).deleteMany({ $or: objectIds });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed`,
      modified: result.modifiedCount || result.deletedCount
    });
  } catch (e: any) {
    if (e.message === 'Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Bulk operation failed', message: e.message }, { status: 500 });
  }
}

