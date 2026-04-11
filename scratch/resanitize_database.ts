import { NewsService } from '../lib/news-service';
import { AdvancedScraperService } from '../lib/news-scraper';
import { NewsAIService } from '../lib/ai/news-ai';
import { supabaseAdmin } from '../lib/supabase';

async function resanitizeDatabase() {
    console.log('--- STARTING GLOBAL FORCED CONTEXT PURGE ---');
    if (!supabaseAdmin) {
        console.error('CRITICAL: Supabase Admin client not initialized');
        return;
    }

    try {
        const allNews = await NewsService.getAllNews();
        console.log(`[1] Found ${allNews.length} documents in cluster.`);

        let updatedCount = 0;
        for (const item of allNews) {
            console.log(`[2] TARGETING ID: ${item.id} (${item.title.slice(0, 30)}...)`);
            
            // Re-generate deterministic draft
            const draft = NewsAIService.generateDeterministicDraft({
                topic: item.title,
                region: item.country || 'Global',
                sourceMaterial: item.content || ''
            });

            // Apply the new ULTRA-SCRUBBER (cleanHtml)
            const cleanContent = AdvancedScraperService.cleanHtml(draft.body);
            const cleanSummary = AdvancedScraperService.cleanHtml(draft.executive_summary);

            console.log(`    CLEANING SUMMARY FOR: ${draft.digital_headline.slice(0, 30)}...`);
            
            const { error, data } = await supabaseAdmin
                .from('news')
                .update({
                    title: draft.digital_headline,
                    summary: cleanSummary,
                    content: cleanContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id)
                .select();

            if (error) {
                console.error(`    FAILED TO UPDATE ${item.id}:`, error.message);
            } else {
                console.log(`    SUCCESS: Updated record ${item.id}. Summary Length: ${cleanSummary.length}`);
                updatedCount++;
            }
        }

        console.log(`[3] Success. Officially purged and humanized ${updatedCount} intelligence nodes.`);
        console.log('--- FORCED PURGE COMPLETE ---');
    } catch (error) {
        console.error('--- ERROR DURING CLUSTER PURGE ---', error);
    }
}

resanitizeDatabase();
