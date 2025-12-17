import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeExamTemplate } from '@/lib/models/ExamTemplate';
import type { ExamTemplate } from '@/lib/models/ExamTemplate';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const exams = await db
      .collection<ExamTemplate>('examTemplates')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json({ exams: exams.map(serializeExamTemplate) });
  } catch (error: any) {
    console.error('Exam templates fetch error:', error);
    return NextResponse.json({ error: 'Failed to load exams', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      questionBankIds,
      questionIds,
      durationMinutes,
      totalMarks,
      category,
      examType,
      tags,
      sections,
      releaseAt,
      closeAt,
      visibility,
      cohorts,
      passingScore,
      price,
    } = body;

    if (!name || !durationMinutes || !totalMarks) {
      return NextResponse.json({ error: 'Exam name, duration, and total marks are required' }, { status: 400 });
    }

    const record = {
      name,
      description: description || '',
      questionBankIds: Array.isArray(questionBankIds) ? questionBankIds : [],
      questionIds: Array.isArray(questionIds) ? questionIds : [],
      durationMinutes: Number(durationMinutes) || 60,
      totalMarks: Number(totalMarks) || 0,
      category: category || '',
      examType: examType || '',
      tags: Array.isArray(tags) ? tags : [],
      sections: Array.isArray(sections) ? sections : [],
      releaseAt: releaseAt || null,
      closeAt: closeAt || null,
      visibility: visibility || 'private',
      cohorts: Array.isArray(cohorts) ? cohorts : [],
      passingScore: passingScore !== undefined ? Number(passingScore) : undefined,
      price: price && price.amount ? { currency: price.currency || 'USD', amount: Number(price.amount) } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('examTemplates').insertOne(record);
    return NextResponse.json({ success: true, exam: serializeExamTemplate({ ...record, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Exam template create error:', error);
    return NextResponse.json({ error: 'Failed to create exam', message: error.message }, { status: 500 });
  }
}
