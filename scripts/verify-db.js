const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function purge() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // First, find exactly what those items are by ID
    const { data, error } = await supabase
        .from('news')
        .select('id, title, created_at')
        .lt('created_at', oneWeekAgo);

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log(`Found ${data.length} items to purge.`);

    if (data.length > 0) {
        const ids = data.map(n => n.id);
        const { error: deleteError } = await supabase
            .from('news')
            .delete()
            .in('id', ids);
            
        if (deleteError) {
            console.error('Delete error:', deleteError);
        } else {
            console.log(`Successfully purged ${ids.length} stale items from the database natively.`);
        }
    }
}

purge();
