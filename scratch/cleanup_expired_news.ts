import { supabaseAdmin } from '../lib/supabase';

async function cleanupExpiredNews() {
    console.log('--- STARTING NEWS LIFECYCLE PURGE ---');
    if (!supabaseAdmin) {
        console.error('CRITICAL: Supabase Admin client not initialized');
        return;
    }

    try {
        const now = new Date().toISOString();
        
        // 1. Identify expired nodes
        const { data: expired, error: findError } = await supabaseAdmin
            .from('news')
            .select('id, title, expires_at')
            .lte('expires_at', now);

        if (findError) throw findError;

        if (!expired || expired.length === 0) {
            console.log('[Maintenance] Zero expired dispatches found. Cluster is healthy.');
            return;
        }

        console.log(`[Maintenance] Found ${expired.length} expired dispatches ready for decommissioning.`);

        // 2. Execute Purge
        const { error: deleteError } = await supabaseAdmin
            .from('news')
            .delete()
            .lte('expires_at', now);

        if (deleteError) throw deleteError;

        console.log(`[Maintenance] Successfully purged ${expired.length} nodes from the database.`);
        expired.forEach(item => {
            console.log(`  - Decommissioned: ${item.title}`);
        });

        console.log('--- LIFECYCLE PURGE COMPLETE ---');
    } catch (error) {
        console.error('--- ERROR DURING MAINTENANCE CYCLE ---', error);
    }
}

cleanupExpiredNews();
