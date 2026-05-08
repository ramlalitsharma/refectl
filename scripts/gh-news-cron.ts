import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('[GH Cron] Starting standalone news automation...');
  try {
    const { NewsAutomationService } = await import('../lib/news-automation');
    const results = await NewsAutomationService.ingestRoamingGlobalNews(1);
    console.log('[GH Cron] Success. Ingested:', results.length);
  } catch (error) {
    console.error('[GH Cron] News automation failed:', error);
    process.exit(1);
  }
}

main();
