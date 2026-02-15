import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { action, selectedText, chapterContent, chapterTitle, bookContext } = await req.json();

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        let prompt = '';
        let systemPrompt = `You are an expert ebook writer and content creator. You write engaging, professional, and high-quality content.`;

        // Build context
        const context = `
Book Title: ${bookContext.title || 'Untitled'}
Tone: ${bookContext.tone || 'Professional'}
Audience: ${bookContext.audience || 'General'}
Focus: ${bookContext.focus || 'General'}
Current Chapter: ${chapterTitle || 'Untitled Chapter'}
`;

        switch (action) {
            case 'continue':
                prompt = `${context}

Current chapter content:
${chapterContent}

Continue writing this chapter naturally from where it left off. Write 2-3 paragraphs that flow seamlessly from the existing content. Maintain the same tone and style.`;
                break;

            case 'expand':
                prompt = `${context}

Selected text to expand:
${selectedText || chapterContent}

Expand and elaborate on this content. Add more details, examples, and depth. Make it more comprehensive while maintaining clarity and engagement.`;
                break;

            case 'rewrite':
                prompt = `${context}

Content to rewrite:
${selectedText || chapterContent}

Rewrite this content in a ${bookContext.tone} tone. Improve clarity, flow, and engagement while preserving the core message.`;
                break;

            case 'summarize':
                prompt = `${context}

Content to summarize:
${selectedText || chapterContent}

Create a concise, clear summary of this content. Capture the key points and main ideas in 2-3 sentences.`;
                break;

            case 'seo':
                systemPrompt = 'You are an SEO expert specializing in ebook metadata optimization.';
                prompt = `Generate comprehensive SEO metadata for this ebook:

Title: ${bookContext.title}
Description: ${bookContext.description || 'Not provided'}
Genre: ${bookContext.genre || 'Not specified'}
Audience: ${bookContext.audience}
Tags: ${bookContext.tags || 'Not provided'}

Generate:
1. An SEO-optimized title (60 characters max)
2. A compelling meta description (155 characters max)
3. 10-15 relevant keywords
4. 5 category suggestions
5. A catchy subtitle
6. Social media description (120 characters)

Return as JSON with keys: seoTitle, metaDescription, keywords (array), categories (array), subtitle, socialDescription`;
                break;

            case 'chapter':
                prompt = `${context}

Generate a complete chapter based on this title: "${chapterTitle}"

Write a comprehensive, engaging chapter that:
- Has a clear introduction
- Develops the topic thoroughly
- Includes examples or case studies
- Has a strong conclusion
- Is approximately 1500-2000 words
- Matches the book's tone and audience`;
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: action === 'seo' ? 1000 : 2000,
        });

        const generatedContent = completion.choices[0]?.message?.content || '';

        // For SEO, parse JSON response
        if (action === 'seo') {
            try {
                const seoData = JSON.parse(generatedContent);
                return NextResponse.json({ seo: seoData });
            } catch (e) {
                // If not valid JSON, return as raw content
                return NextResponse.json({
                    seo: {
                        seoTitle: bookContext.title,
                        metaDescription: generatedContent.substring(0, 155),
                        keywords: [],
                        categories: [],
                        subtitle: '',
                        socialDescription: generatedContent.substring(0, 120)
                    }
                });
            }
        }

        return NextResponse.json({ content: generatedContent });
    } catch (error: any) {
        console.error('AI Assist Error:', error);
        return NextResponse.json(
            { error: error.message || 'AI generation failed' },
            { status: 500 }
        );
    }
}
