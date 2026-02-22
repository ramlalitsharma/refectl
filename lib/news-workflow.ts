import { EmailService } from './email-service';
import { EmailTemplates } from './email-templates';
import { supabaseAdmin } from './supabase';

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
    }
};
