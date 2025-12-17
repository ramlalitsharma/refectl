// POST /api/admin/content/generate-quiz
// Admin only endpoint to generate quiz content

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-service';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin(userId))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { topic, difficulty } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const result = await AIService.generateQuiz(topic, difficulty);

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Generate Quiz Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
