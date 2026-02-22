export type NewsStatus = 'draft' | 'pending_approval' | 'published';

export type NewsCategory = 'World' | 'Politics' | 'Technology' | 'Finance' | 'Environment' | 'Culture' | 'Health' | 'Opinion' | 'Local';

export type NewsCountry =
    | 'Global' | 'Nepal' | 'India' | 'USA' | 'UK'
    | 'Canada' | 'Australia' | 'Germany' | 'France' | 'Japan'
    | 'China' | 'Brazil' | 'South Africa' | 'UAE' | 'Singapore'
    | 'Kenya' | 'Mexico' | 'Italy' | 'South Korea' | 'Israel';

export interface News {
    id: string; // UUID from Supabase
    title: string;
    slug: string;
    content: string; // HTML/JSON from Editor
    summary: string;
    category: NewsCategory | string;
    country: NewsCountry | string;
    cover_image?: string;
    tags?: string[];
    status: NewsStatus;
    author_id: string;
    view_count: number;
    is_trending: boolean;

    // Automation & Source Tracking
    source_url?: string;
    source_name?: string;
    approval_email_sent_at?: string;
    expires_at?: string; // For auto-deletion after 7 days

    // Market Intelligence
    sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
    market_entities?: string[];
    impact_score?: number; // 0-100 indicating market/geopolitical impact

    created_at: string;
    updated_at: string;
    published_at?: string;
}
