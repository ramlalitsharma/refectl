import { NextResponse } from 'next/server';
import { NewsAutomationService } from '@/lib/news-automation';

export async function GET() {
    try {
        const result = await NewsAutomationService.ingestGlobalTrend({
            title: 'Test Debug Title ' + Math.random(),
            category: 'World' as any
        });
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
