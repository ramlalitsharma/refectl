import { supabaseAdmin } from './supabase';
import { openai } from './openai';
import { EmailService } from './email-service';

export const NewsNewsletterService = {
    /**
     * Compiles the top AI-generated stories from the last 24 hours
     * and sends a Daily Pulse email to subscribers (or admins for now).
     */
    async generateAndSendDailyPulse(): Promise<boolean> {
        console.log('[Newsletter] Initiating Daily Pulse generation...');
        if (!supabaseAdmin) {
            console.error('[Newsletter] Missing Supabase Admin for DB query');
            return false;
        }

        // 1. Fetch top 5 published stories from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: recentNews, error } = await supabaseAdmin
            .from('news')
            .select('title, summary, category, country, sentiment, slug')
            .eq('status', 'published')
            .gte('created_at', yesterday.toISOString())
            .order('view_count', { ascending: false })
            .limit(5);

        if (error || !recentNews || recentNews.length === 0) {
            console.log('[Newsletter] No new stories in the past 24h to compile.');
            return false;
        }

        console.log(`[Newsletter] Found ${recentNews.length} stories. Generating HTML...`);

        // 2. Draft the beautiful Newsletter with AI
        const htmlBody = await this.draftNewsletterHTML(recentNews);

        // 3. Send to a test broadcast list (In production, you'd loop through a subscribers table)
        // For now, we simulate sending the final payload.
        const broadcastList = ['admin@teraitimes.com', 'team@refectl.com'];

        for (const email of broadcastList) {
            await EmailService.send({
                to: email,
                subject: 'The Daily Pulse - Terai Times Global Intelligence 🌍',
                html: htmlBody
            });
        }

        console.log('[Newsletter] Daily Pulse Sent successfully.');
        return true;
    },

    /**
     * Uses OpenAI to transform raw article metadata into a cohesive,
     * beautifully formatted HTML newsletter.
     */
    async draftNewsletterHTML(articles: any[]): Promise<string> {
        if (!openai) throw new Error('OpenAI client missing for Newsletter');

        const articleJSON = JSON.stringify(articles, null, 2);

        const prompt = `
        You are the Editor-in-Chief of Terai Times News.
        Your task is to write the "Daily Pulse" morning email newsletter summarizing the global intelligence from the last 24 hours.
        Return ONLY valid HTML that can be directly sent via email. 
        Make the design premium, minimalist, and "Bloomberg-esque" using inline CSS.
        Include a prominent "Read Full Analysis" link for each story pointing to: https://teraitimes.com/news/[slug]

        Articles to cover:
        ${articleJSON}
        
        Instructions:
        - Include a stylish header: "Terai Times | The Daily Pulse"
        - Add a brief 2-sentence executive summary at the top outlining the overarching theme of the day.
        - Display each article clearly with its category, title, summary, and 'View Analysis' link.
        - If an article has sentiment (Bullish/Bearish), mention it subtly.
        - Use clean, enterprise-grade inline CSS (e.g., Arial or Helvetica, nice padding, subtle grays, accents of dark red #B91C1C).
        - DO NOT wrap the output in markdown code blocks like \`\`\`html. Return ONLY the HTML string.
        `;

        const resp = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
        });

        const content = resp.choices[0]?.message?.content || '<div>Newsletter Generation Failed</div>';
        // Strip any accidental markdown formatting if the AI insists
        return content.replace(/^```html/i, '').replace(/```$/i, '').trim();
    }
};
