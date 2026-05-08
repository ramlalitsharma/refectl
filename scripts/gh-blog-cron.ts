import { config } from 'dotenv';
config({ path: '.env.local' });
import { BlogAutomationService } from '../lib/blog-automation';

async function main() {
  console.log('[GH Cron] Starting standalone blog automation...');
  try {
    const result = await BlogAutomationService.generateAutonomousBlog();
    console.log('[GH Cron] Success:', result);
  } catch (error) {
    console.error('[GH Cron] Blog generation failed:', error);
    process.exit(1);
  }
}

main();
