import { config } from 'dotenv';
import { NewsScrapeOrchestrator } from '../lib/news-scrape-orchestrator';

config({ path: '.env.local' });

async function runGlobalScraper() {
  console.log(`\n🌍 [GLOBAL SCRAPER] Initiating Worldwide Intelligence Sweep...`);
  
  const regions = [
    { country: 'Global', query: 'World breaking news today' },
    { country: 'USA', query: 'US politics and technology news' },
    { country: 'UK', query: 'UK business and market news' },
    { country: 'India', query: 'India startup and economy news' },
    { country: 'Nepal', query: 'Nepal national news' }
  ];

  for (const region of regions) {
    console.log(`\n📡 [SCRAPER] Targeting Vector: ${region.country}`);
    try {
      await NewsScrapeOrchestrator.ingestTargeted({
        category: 'Global',
        country: region.country,
        author_id: 'admin_auto_bot',
        status: 'published'
      });
      console.log(`✅ [SCRAPER] Successfully acquired intelligence for ${region.country}`);
    } catch (error: any) {
      console.log(`⚠️ [SCRAPER] Signal dropped for ${region.country}: ${error.message}`);
    }
  }

  console.log(`\n🎉 [GLOBAL SCRAPER] Sweep Complete! System is fully populated.`);
  process.exit(0);
}

runGlobalScraper();
