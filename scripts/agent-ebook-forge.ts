import { config } from 'dotenv';
import { prisma } from '../lib/prisma';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { getOmniBrain } from '../lib/ai/omni-router';

// Load environment variables
config({ path: '.env.local' });

async function runEbookForgeAgent(topic: string) {
  const omniBrain = getOmniBrain();
  console.log(`\n🤖 [AUTONOMOUS COFOUNDER] Waking up...`);
  console.log(`🎯 Assigned Task: Generating Ebook "${topic}"`);

  try {
    // Step 1: Generate Outline
    console.log(`\n🧠 [AGENT] Thinking of a highly profitable outline...`);
    const outlinePrompt = `
      You are an expert digital product creator and marketer. 
      Create a compelling, 5-chapter outline for an Ebook about: ${topic}.
      Return ONLY the chapter titles separated by newlines. No intro, no outro.
    `;
    
    const outlineRaw = await omniBrain.invoke(outlinePrompt);
    const chapterTitles = outlineRaw.split('\n').filter(c => c.trim().length > 0 && !c.includes('Here is'));
    
    console.log(`✅ [AGENT] Outline Generated!`);
    chapterTitles.forEach((c, i) => console.log(`   Chapter ${i+1}: ${c}`));

    // Step 2: Write Content Chapter by Chapter
    const chaptersData: any[] = [];
    
    for (let i = 0; i < chapterTitles.length; i++) {
      const title = chapterTitles[i];
      console.log(`\n✍️ [AGENT] Writing content for: "${title}" (This may take a moment)...`);
      
      const chapterPrompt = `
        You are an expert author writing a premium Ebook.
        Write a detailed, highly valuable, and engaging chapter based on this title: ${title}.
        The content must be formatted in Markdown. Include bullet points, bold text, and actionable advice.
        Write at least 500 words. Do NOT include the chapter title at the top, I will handle that.
      `;
      
      const chapterContent = await omniBrain.invoke(chapterPrompt);
      
      chaptersData.push({
        id: `chap-${i+1}`,
        title: title,
        content: chapterContent
      });
    }

    // Step 3: Generate SEO Metadata
    console.log(`\n💰 [AGENT] Generating Market Metadata...`);
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Step 4: Save to PostgreSQL via Prisma
    console.log(`\n💾 [AGENT] Pushing asset to the PostgreSQL Vault...`);
    
    await prisma.ebook.create({
      data: {
        authorId: "agent-nvidia-nim", // Tracks autonomous generation
        title: topic,
        audience: "Enterprise Developers",
        tone: "Professional, Authoritative",
        focus: "Advanced Strategies",
        requestedChapters: chaptersData.length,
        chapters: chaptersData, // Stored as JSON automatically by Prisma
        tags: [slug.split('-')[0], "AI-Generated", "Premium"],
        status: "published",
        coverImageUrl: `https://source.unsplash.com/800x600/?${slug.split('-')[0]},abstract`,
        releaseAt: new Date(),
        seo: { keyword: topic, description: `A comprehensive premium guide on ${topic}.` }
      }
    });
    
    console.log(`\n🎉 [SUCCESS] Ebook "${topic}" has been successfully forged and injected into the Marketplace!`);
    
  } catch (error) {
    console.error(`\n❌ [AGENT CRASHED] Failed to forge Ebook:`, error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Execute the Agent
const targetTopic = process.argv[2] || "Mastering Artificial Intelligence in 2026";
runEbookForgeAgent(targetTopic);
