import { config } from 'dotenv';
config({ path: '.env.local' });
import { NewsAutomationService } from '../lib/news-automation';

async function main() {
  console.log('[GH Cron] Starting standalone news ingestion...');
  try {
    const count = 5; // Fixed count or pass via args
    console.log(`[GH Cron] Attempting to ingest ${count} articles.`);
    const published = await NewsAutomationService.ingestRoamingGlobalNews(count);
    console.log(`[GH Cron] Success. Published ${published.length} articles.`);
  } catch (error) {
    console.error('[GH Cron] News ingestion failed:', error);
    process.exit(1);
  }
}

main();
