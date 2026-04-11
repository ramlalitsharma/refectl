import { AdvancedScraperService } from '../lib/news-scraper';

async function testScraper() {
    console.log('--- STARTING SCRAPER VERIFICATION ---');
    try {
        const trends = await AdvancedScraperService.scrapeTrends();
        console.log(`[1] Scraped ${trends.length} raw trends.`);
        
        if (trends.length > 0) {
            console.log('Top Trends Identified:');
            trends.slice(0, 10).forEach((t, i) => {
                console.log(`${i+1}. [${t.category}] [${t.country || 'Global'}] ${t.title} (${t.source})`);
            });
            console.log('--- SCRAPER VERIFICATION: SUCCESS ---');
        } else {
            console.log('--- SCRAPER VERIFICATION: NO TRENDS FOUND ---');
        }
    } catch (error) {
        console.error('--- SCRAPER VERIFICATION: FAILED ---', error);
    }
}

testScraper();
