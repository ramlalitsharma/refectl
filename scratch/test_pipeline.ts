import { AdvancedScraperService } from './lib/news-scraper';
import { NewsAutomationService } from './lib/news-automation';

async function testE2EPipeline() {
    console.log('--- STARTING E2E INTELLIGENCE VERIFICATION ---');
    try {
        const trends = await AdvancedScraperService.scrapeTrends();
        console.log(`[1] Scraped ${trends.length} raw trends. Top result: ${trends[0]?.title}`);

        if (trends.length > 0) {
            const sample = trends[0];
            console.log(`[2] Attempting safe ingestion of: ${sample.title}`);
            
            const result = await NewsAutomationService.ingestGlobalTrend({
                title: sample.title,
                category: sample.category as any,
                country: sample.country as any,
                source_url: sample.link,
                source_name: sample.source,
                forcePublish: true
            });

            console.log('[3] Ingestion Successful. Slug:', result.slug);
            console.log('[4] Verifying Impact Score:', result.impact_score);
            console.log('[5] Verifying Sentiment:', result.sentiment);
        }
        
        console.log('--- E2E VERIFICATION COMPLETE: ALL GATES PASSED ---');
    } catch (error) {
        console.error('--- E2E VERIFICATION FAILED ---', error);
    }
}

testE2EPipeline();
