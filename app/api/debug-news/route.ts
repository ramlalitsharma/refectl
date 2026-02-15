
import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';

export async function GET() {
    try {
        const envConfig = {
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        };

        const all = await NewsService.getAllNews().catch(err => ({ error: err.message }));
        const published = await NewsService.getPublishedNews().catch(err => ({ error: err.message }));

        let allNews = [];
        if (Array.isArray(all)) {
            allNews = all.map(n => ({
                id: n.id,
                title: n.title,
                status: n.status,
                country: n.country,
                category: n.category,
                published_at: n.published_at
            }));
        }

        return NextResponse.json({
            environment: envConfig,
            all_news_count: Array.isArray(all) ? all.length : 'Error',
            published_news_count: Array.isArray(published) ? published.length : 'Error',
            all_news_sample: allNews,
            published_error: !Array.isArray(published) ? published : null,
            all_error: !Array.isArray(all) ? all : null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
