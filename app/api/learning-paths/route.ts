import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { serializeLearningPath } from '@/lib/models/LearningPath';
import type { LearningPath } from '@/lib/models/LearningPath';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';
    const { userId } = await auth();

    const db = await getDatabase();
    const query: any = {};

    if (isPublic) {
      query.isPublic = true;
    } else if (userId) {
      query.authorId = userId;
    }

    const paths = await db
      .collection<LearningPath>('learningPaths')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      paths: paths.map(serializeLearningPath),
    });
  } catch (error: any) {
    console.error('Learning paths fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, courses, estimatedDuration, difficulty, tags, isPublic } = body;

    if (!title || !courses || !Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one course are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const learningPath = {
      title: title.trim(),
      description: description?.trim() || undefined,
      authorId: userId,
      courses: courses.map((c: any, index: number) => ({
        courseId: c.courseId,
        order: c.order || index,
        isRequired: c.isRequired !== false,
        prerequisites: c.prerequisites || [],
      })),
      estimatedDuration: estimatedDuration || undefined,
      difficulty: difficulty || 'intermediate',
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic || false,
      enrolledCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('learningPaths').insertOne(learningPath);
    const created = await db.collection('learningPaths').findOne({ _id: result.insertedId });

    return NextResponse.json({ path: serializeLearningPath(created as any) });
  } catch (error: any) {
    console.error('Learning path creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path', message: error.message },
      { status: 500 }
    );
  }
}

