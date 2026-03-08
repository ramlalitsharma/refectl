import { supabase, supabaseAdmin } from './supabase';
import { News } from './models/News';

export const NewsService = {
    isPublishedStatus(status: unknown): boolean {
        const s = String(status || '').toLowerCase();
        return s === 'published' || s === 'live' || s === 'active relay';
    },

    /**
     * Get all published news for public view with filtering
     */
    async getPublishedNews(filters?: { country?: string; category?: string; query?: string; limit?: number }): Promise<News[]> {
        const client = supabaseAdmin || supabase;

        let query = client
            .from('news')
            .select('*')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay']);

        if (filters?.country && filters.country !== 'All' && filters.country !== 'Global') {
            query = query.eq('country', filters.country);
        }

        if (filters?.category && filters.category !== 'All') {
            query = query.eq('category', filters.category);
        }

        const queryText = (filters?.query || '').trim();
        if (queryText) {
            const escaped = queryText.replace(/[%_,]/g, ' ');
            query = query.or(`title.ilike.%${escaped}%,summary.ilike.%${escaped}%,content.ilike.%${escaped}%`);
        }

        if (typeof filters?.limit === 'number' && filters.limit > 0) {
            query = query.limit(filters.limit);
        }

        // Try ordering by published_at first
        const primary = await query.order('published_at', { ascending: false });
        if (primary.error) {
            console.warn('NewsService.getPublishedNews primary query failed, trying fallback:', primary.error.message);
        }

        let data = primary.error ? [] : (primary.data || []);

        // Fallback: If no data found, try broader search without published_at constraint if needed, 
        // OR simply if the first query missed items due to strict filtering?
        // Actually, if we found nothing, maybe status casing is still weird.
        // Let's try to fetch everything and filter in memory as a last resort if primary failed.
        if (!data.length) {
            const fallback = await client
                .from('news')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit to avoid fetching too much

            if (fallback.error) {
                console.error('NewsService.getPublishedNews fallback query failed:', fallback.error);
                return [];
            }

            if (fallback.data) {
                // Filter in memory for fuzzy match
                data = fallback.data.filter((n: any) => {
                    const c = (n.country || '');
                    const cat = (n.category || '');
                    const isPub = this.isPublishedStatus(n.status);

                    const matchCountry = !filters?.country || filters.country === 'All' || filters.country === 'Global' || c === filters.country;
                    const matchCategory = !filters?.category || filters.category === 'All' || cat === filters.category;

                    const text = `${n.title || ''} ${n.summary || ''} ${n.content || ''}`.toLowerCase();
                    const matchQuery = !queryText || text.includes(queryText.toLowerCase());

                    return isPub && matchCountry && matchCategory && matchQuery;
                });
            }
        }

        if (typeof filters?.limit === 'number' && filters.limit > 0 && data.length > filters.limit) {
            data = data.slice(0, filters.limit);
        }

        return data;
    },

    /**
     * Get trending news
     */
    async getTrendingNews(limit: number = 5): Promise<News[]> {
        const client = supabaseAdmin || supabase;
        const res = await client
            .from('news')
            .select('*')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .order('view_count', { ascending: false })
            .limit(limit);
        if (res.error) {
            return [];
        }
        let data = res.data || [];
        if (!data.length) {
            const fallback = await client
                .from('news')
                .select('*')
                .not('published_at', 'is', null)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (!fallback.error) {
                data = fallback.data || [];
            }
        }
        return data;
    },

    /**
     * Get recent news pulse
     */
    async getRecentNews(limit: number = 10): Promise<News[]> {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('*')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Get all news for admin view
     */
    async getAllNews() {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            return [];
        }
        return data || [];
    },

    /**
     * Get a single news item by slug
     */
    async getNewsBySlug(slug: string): Promise<News | null> {
        const client = supabaseAdmin || supabase;
        const res = await client
            .from('news')
            .select('*')
            .eq('slug', slug)
            .single();
        if (res.error && res.error.code !== 'PGRST116') {
            throw res.error;
        }
        if (res.data) return res.data;
        const alt = await client
            .from('news')
            .select('*')
            .eq('slug', slug)
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .limit(1);
        if (!alt.error && (alt.data || []).length) {
            return alt.data![0] as any;
        }
        return null;
    },

    /**
     * Get a single news item by ID
     */
    async getNewsById(id: string): Promise<News | null> {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const { data, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    /**
     * Create or update news
     */
    async upsertNews(news: Partial<News>) {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const payload = {
            ...news,
            updated_at: new Date().toISOString(),
            published_at:
                typeof news.published_at !== 'undefined'
                    ? news.published_at
                    : (news.status || '').toLowerCase() === 'published'
                        ? new Date().toISOString()
                        : null
        } as any;

        const attempt = await supabaseAdmin
            .from('news')
            .upsert(payload)
            .select()
            .single();

        if (!attempt.error) return attempt.data;

        const message = attempt.error?.message || '';
        if (message.includes('source_name') || message.includes('source_url')) {
            const fallback = { ...payload };
            delete fallback.source_name;
            delete fallback.source_url;
            const retry = await supabaseAdmin
                .from('news')
                .upsert(fallback)
                .select()
                .single();
            if (!retry.error) return retry.data;
            throw retry.error;
        }

        throw attempt.error;
    },

    /**
     * Delete news article
     */
    async deleteNews(id: string) {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const { error } = await supabaseAdmin
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Get unique popular categories (Global Sectors)
     */
    async getPopularCategories(limit: number = 6): Promise<string[]> {
        const client = supabaseAdmin || supabase;
        // Supabase doesn't easily do DISTINCT over RPC without custom functions, 
        // so we fetch recent items and extract unique categories in memory
        const { data, error } = await client
            .from('news')
            .select('category')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .order('created_at', { ascending: false })
            .limit(100);

        if (error || !data) return ['Geopolitics', 'Markets & Finance', 'Technology & AI', 'Global Trade'];

        const counts = data.reduce((acc, curr) => {
            if (curr.category) acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(e => e[0]);
    },

    /**
     * Get unique popular countries (Global Regions)
     */
    async getPopularCountries(limit: number = 6): Promise<string[]> {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('country')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .order('created_at', { ascending: false })
            .limit(100);

        if (error || !data) return ['Global', 'USA', 'UK', 'China'];

        const counts = data.reduce((acc, curr) => {
            if (curr.country && curr.country !== 'Global') acc[curr.country] = (acc[curr.country] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(e => e[0]);
    },

    async getAvailableFilters(): Promise<{ countries: string[]; categories: string[] }> {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('country, category, created_at')
            .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay'])
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error || !data) {
            return {
                countries: ['All', 'Global', 'USA', 'India', 'Nepal'],
                categories: ['World', 'Politics', 'Business'],
            };
        }

        const countriesSet = new Set<string>();
        const categoriesSet = new Set<string>();

        for (const item of data as Array<{ country?: string | null; category?: string | null }>) {
            const country = (item.country || '').trim();
            const category = (item.category || '').trim();

            if (country) countriesSet.add(country);
            if (category) categoriesSet.add(category);
        }

        const countries = ['All', ...Array.from(countriesSet).filter((c) => c !== 'All').sort((a, b) => a.localeCompare(b))];
        const categories = Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));

        return { countries, categories };
    },
};
