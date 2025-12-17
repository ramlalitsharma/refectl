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
    const { ObjectId } = await import('mongodb');
    const orFilters = ids.map((id: string) => {
      return /^[a-fA-F0-9]{24}$/.test(id) ? { _id: new ObjectId(id) } : { slug: id };
    });

    let result;
    switch (action) {
      case 'publish':
        result = await db.collection(collection).updateMany(
          { $or: orFilters },
          { $set: { status: 'published', updatedAt: new Date() } }
        );
        break;
      case 'unpublish':
        result = await db.collection(collection).updateMany(
          { $or: orFilters },
          { $set: { status: 'draft', updatedAt: new Date() } }
        );
        break;
      case 'delete':
        result = await db.collection(collection).deleteMany({ $or: orFilters });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const modified = (('modifiedCount' in result) ? (result as any).modifiedCount : (('deletedCount' in result) ? (result as any).deletedCount : 0)) || 0;
    return NextResponse.json({
      success: true,
      message: `${action} completed`,
      modified,
    });
  } catch (e: any) {
    if (e.message === 'Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Bulk operation failed', message: e.message }, { status: 500 });
  }
}

