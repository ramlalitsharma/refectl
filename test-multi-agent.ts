
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { NewsAIService } from './lib/ai/news-ai';

async function verify() {
  console.log('--- Resiliency Test Start ---');
  try {
    const result = await NewsAIService.generateNewsDraftHybrid({
      topic: 'Space Exploration News in USA',
      region: 'USA',
      tone: 'Analytical',
      depth: 'Standard',
      sourceMaterial: 'Title: NASA lands on Mars\nContext: Evidence of water found.'
    });
    console.log('Ingestion Mode:', result.mode);
    console.log('Final Title:', result.draft.print_headline);
  } catch (err) {
    console.error('CRITICAL FAILURE:', err);
  }
  console.log('--- Resiliency Test End ---');
  process.exit();
}
verify();

