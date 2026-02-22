import { supabaseAdmin } from './supabase';

/**
 * Downloads an image from a URL and uploads it to Supabase Storage.
 * Ensures we don't rely on temporary external URLs.
 */
export async function uploadImageFromUrl(url: string, bucket: string = 'news-images'): Promise<string | null> {
    try {
        console.log(`[Storage] Processing image upload for: ${url.substring(0, 50)}...`);

        if (!supabaseAdmin) throw new Error('Supabase Admin Client Offline');

        // 1. Fetch image data
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.split('/')[1] || 'jpg';

        // 2. Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
        const filePath = `auto/${filename}`;

        // 3. Upload to Supabase
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .upload(filePath, blob, {
                contentType,
                upsert: true
            });

        if (error) {
            console.error('[Storage] Supabase Upload Error:', error);
            throw error;
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(filePath);

        console.log(`[Storage] Successfully persisted: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error('[Storage] Failed to persist image:', error);
        return null; // Return null so the caller can fallback to a placeholder
    }
}
