import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-check';
import { InsightsEngine } from '@/lib/insights-engine';

/**
 * GET: Returns language performance metrics.
 */
export async function GET() {
    try {
        await requireAdmin();
        const performance = await InsightsEngine.getLanguagePerformance();
        return NextResponse.json(performance);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}

/**
 * POST: Triggers the AI-driven global problem analysis.
 */
export async function POST(req: Request) {
    try {
        await requireAdmin();
        
        const body = await req.json().catch(() => ({}));
        const limit = body.limit || 30;

        const insights = await InsightsEngine.analyzeGlobalProblems(limit);
        
        return NextResponse.json({ 
            success: true, 
            insights,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('API /api/admin/insights/analyze error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
