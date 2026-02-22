import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { NewsAutomationService } from './lib/news-automation';

async function test() {
  try {
    console.log('Testing ingestGlobalTrend...');
    const result = await NewsAutomationService.ingestGlobalTrend({
       title: 'Test Trend Title 123',
       category: 'World' as any
    });
    console.log('Final Result:', result);
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    process.exit();
  }
}
test();
