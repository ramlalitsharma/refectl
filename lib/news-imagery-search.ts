import axios from 'axios';

/**
 * News Imagery Search Service (NISS)
 * Provides zero-cost, high-quality image discovery for global news.
 */
export const NewsImagerySearch = {
    /**
     * Searches for a high-quality stock photo on Unsplash (Public Search).
     * Returns the high-res URL or null if not found.
     */
    async findFreeStockPhoto(keywords: string[]): Promise<string | null> {
        const query = keywords.slice(0, 3).join(' ');
        console.log(`[Imagery Search] Scanning for: "${query}"`);

        try {
            // Strategy: Use Unsplash public search with a high-agent string to avoid simple blocks.
            // We target the 'images.unsplash.com' CDN pattern.
            const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000
            });

            const html = response.data;
            // Robust regex to find full-resolution photo URLs (e.g., https://images.unsplash.com/photo-...)
            const photoMatch = html.match(/https:\/\/images\.unsplash\.com\/photo-[^?"]+/);
            
            if (photoMatch) {
                const photoUrl = photoMatch[0];
                console.log(`[Imagery Search] Success: ${photoUrl}`);
                // Return with professional formatting params
                return `${photoUrl}?auto=format&fit=crop&w=1600&q=80`;
            }
        } catch (error) {
            console.warn('[Imagery Search] Public discovery failed. Bypassing to internal library.', error);
        }

        return null;
    },

    /**
     * Strategy B: Wikimedia Commons (Geopolitical/Public Domain)
     */
    async scanWikimedia(topic: string): Promise<string | null> {
        try {
            const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(topic)}&pithumbsize=1024&origin=*`;
            const response = await axios.get(api);
            const pages = response.data.query.pages;
            const firstPageId = Object.keys(pages)[0];
            const thumb = pages[firstPageId]?.thumbnail?.source;
            return thumb || null;
        } catch {
            return null;
        }
    }
};
