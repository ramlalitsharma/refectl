import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('[GH Cron] Starting standalone blog automation...');
  try {
    const { BlogAutomationService } = await import('../lib/blog-automation');
    const result = await BlogAutomationService.generateAutonomousBlog();
    console.log('[GH Cron] Success:', result);
  } catch (error) {
    console.error('[GH Cron] Blog generation failed:', error);
    process.exit(1);
  }
}

main();
