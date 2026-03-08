import { EmailService } from './email-service';
import { EmailTemplates } from './email-templates';
import { supabaseAdmin } from './supabase';
import { NewsAutomationService } from './news-automation';
import { NewsService } from './news-service';

function normalizeText(value?: string | null): string {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function readQualityScore(tags?: string[]): number | null {
    const hit = (tags || []).find((tag) => tag.startsWith('quality_score:'));
    if (!hit) return null;
    const parsed = Number(hit.split(':')[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

function shouldRefreshLegacyStory(item: any): boolean {
    const title = normalizeText(item?.title);
    const summary = normalizeText(item?.summary);
    const content = normalizeText(item?.content);
    const qualityScore = readQualityScore(Array.isArray(item?.tags) ? item.tags : []);

    if (!item?.source_url || !/^https?:\/\//i.test(item.source_url)) return false;
    if (String(item?.author_id || '') !== 'global-intelligence-bot') return false;
    if (String(item?.status || '').toLowerCase() !== 'published') return false;

    return (
        /^global news update$/i.test(title) ||
        title.length < 24 ||
        summary.length < 120 ||
        content.length < 1400 ||
        (qualityScore !== null && qualityScore < 72)
    );
}

export const NewsWorkflowService = {
    /**
     * Scans for articles pending approval and notifies admins.
     * Runs hourly via cron.
     */
    async processApprovalQueue() {
        if (!supabaseAdmin) return;

        // 1. Fetch articles pending approval that haven't been notified yet (or notified > 4h ago)
        const { data: pendingItems, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('status', 'pending_approval')
            .or('approval_email_sent_at.is.null,approval_email_sent_at.lt.' + new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString());

        if (error || !pendingItems?.length) return;

        console.log(`[Workflow] Found ${pendingItems.length} items in approval queue.`);

        // 2. Notify Admins (Super Admin and Admin)
        // In this system, we'll send a digest or individual alerts. 
        // For simplicity and immediate action, we'll send a digest to the configured admin email.
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@refectl.com';

        await EmailService.send({
            to: adminEmail,
            subject: `[Terai Times] ${pendingItems.length} Articles Awaiting Approval 🗞️`,
            html: (EmailTemplates as any).newsApprovalDigest(pendingItems)
        });

        // 3. Mark as notified
        const ids = pendingItems.map(i => i.id);
        await supabaseAdmin
            .from('news')
            .update({ approval_email_sent_at: new Date().toISOString() })
            .in('id', ids);
    },

    /**
     * Performs maintenance: Deletes articles older than 7 days.
     */
    async performMaintenance() {
        if (!supabaseAdmin) return;

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        await this.refreshLegacyAutomationStories();

        // 1) Always delete explicitly expired items
        const expiredDelete = await supabaseAdmin
            .from('news')
            .delete()
            .lt('expires_at', now);

        if (expiredDelete.error) {
            console.error('[Workflow] Maintenance (expires_at) failed:', expiredDelete.error);
        }

        // 2) Delete old autonomous/bot-generated items after 7 days
        const botDelete = await supabaseAdmin
            .from('news')
            .delete()
            .eq('author_id', 'global-intelligence-bot')
            .lt('created_at', oneWeekAgo);

        if (botDelete.error) {
            console.error('[Workflow] Maintenance (bot cleanup) failed:', botDelete.error);
            return;
        }

        console.log('[Workflow] Maintenance cleanup completed (expired + bot archives).');
    },

    async refreshLegacyAutomationStories(limit: number = 3) {
        if (!supabaseAdmin) return;

        const { data: candidates, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('author_id', 'global-intelligence-bot')
            .eq('status', 'published')
            .order('updated_at', { ascending: true })
            .limit(12);

        if (error) {
            console.error('[Workflow] Legacy refresh scan failed:', error);
            return;
        }

        const refreshQueue = (candidates || []).filter(shouldRefreshLegacyStory).slice(0, limit);
        if (!refreshQueue.length) {
            console.log('[Workflow] No legacy automation stories needed refresh.');
            return;
        }

        console.log(`[Workflow] Refreshing ${refreshQueue.length} legacy automation stor${refreshQueue.length === 1 ? 'y' : 'ies'}.`);

        for (const item of refreshQueue) {
            await this.refreshAutomationStory(item);
        }
    },

    async refreshAutomationStoryBySlug(slug: string) {
        if (!supabaseAdmin || !slug) return;
        const { data: item, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('slug', slug)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[Workflow] Targeted refresh lookup failed:', error);
            return;
        }

        if (!item) {
            console.log(`[Workflow] No story found for slug ${slug}.`);
            return;
        }

        await this.refreshAutomationStory(item);
    },

    async refreshAutomationStory(item: any) {
        if (!item?.id) return;
        try {
            const regenerated = await NewsAutomationService.autoGenerateArticle({
                title: item.title,
                category: item.category || 'World',
                country: item.country || 'Global',
                author_id: item.author_id || 'global-intelligence-bot',
                source_url: item.source_url,
                source_name: item.source_name,
                status: 'published',
                forcePublish: true,
            });

            await NewsService.upsertNews({
                id: item.id,
                title: regenerated.title || item.title,
                slug: regenerated.slug || item.slug,
                summary: regenerated.summary || item.summary,
                content: regenerated.content || item.content,
                cover_image: regenerated.cover_image || item.cover_image,
                tags: regenerated.tags || item.tags,
                category: regenerated.category || item.category,
                country: regenerated.country || item.country,
                source_url: regenerated.source_url || item.source_url,
                source_name: regenerated.source_name || item.source_name,
                sentiment: typeof regenerated.sentiment !== 'undefined' ? regenerated.sentiment : item.sentiment,
                market_entities: regenerated.market_entities || item.market_entities,
                impact_score: typeof regenerated.impact_score === 'number' ? regenerated.impact_score : item.impact_score,
                status: 'published',
                is_trending: typeof regenerated.is_trending === 'boolean' ? regenerated.is_trending : item.is_trending,
                author_id: item.author_id || 'global-intelligence-bot',
                created_at: item.created_at,
                published_at: item.published_at || item.created_at,
                expires_at: item.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
        } catch (refreshError) {
            console.error(`[Workflow] Legacy refresh failed for ${item.id}:`, refreshError);
        }
    },
};
