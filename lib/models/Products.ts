export type ProductStatus = 'draft' | 'pending_ai_review' | 'published';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Ebook {
    id: string; // Supabase UUID
    title: string;
    slug: string;
    description: string;
    content_markdown: string; // The raw AI-generated markdown
    pdf_url?: string; // Link to the compiled PDF in Supabase Storage
    cover_image: string; // Generated via AI image models
    
    // Taxonomy
    category: string;
    tags: string[];
    
    // Monetization
    price: number; // e.g., 9.99
    is_free_for_leads: boolean; // If true, given away for email capture
    
    // Agentic Metadata
    generated_by_agent: string; // e.g., 'NVIDIA-Llama3-70B-EbookForge'
    generation_prompt_hash?: string;
    market_relevance_score: number; // 0-100 indicating trending strength when created
    
    status: ProductStatus;
    downloads: number;
    
    created_at: string;
    updated_at: string;
    published_at?: string;
}

export interface CourseModule {
    id: string;
    title: string;
    order: number;
    content: string; // AI generated lesson content
    video_script?: string; // AI generated script if a text-to-video avatar is integrated later
    estimated_minutes: number;
}

export interface Course {
    id: string; // Supabase UUID
    title: string;
    slug: string;
    description: string;
    cover_image: string;
    
    // Taxonomy
    category: string;
    difficulty: DifficultyLevel;
    tags: string[];
    
    // Curriculum
    modules: CourseModule[];
    total_duration_minutes: number;
    
    // Monetization
    price: number;
    
    // Agentic Metadata
    generated_by_agent: string;
    curriculum_source?: string; // e.g., 'Google Trends analysis of Next.js 14'
    
    status: ProductStatus;
    enrolled_students: number;
    
    created_at: string;
    updated_at: string;
    published_at?: string;
}
