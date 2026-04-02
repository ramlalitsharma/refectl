import { NewsService } from './news-service';
import { openai } from './openai';
import { News } from './models/News';

export interface BusinessInsight {
    region: string;
    problem: string;
    solution: string;
    impactScore: number;
    recommendedActions: string[];
    language: string;
}

export interface LanguagePerformance {
    locale: string;
    engagementScore: number; // Based on news views and activity
    contentVolume: number;
    growthTrend: 'increasing' | 'stable' | 'decreasing';
}

export const InsightsEngine = {
    /**
     * Analyze worldwide news to identity business problems and solutions.
     */
    async analyzeGlobalProblems(limit: number = 30): Promise<BusinessInsight[]> {
        if (!openai) throw new Error('OpenAI client not initialized');

        // 1. Fetch recent global news
        const news = await NewsService.getRecentNews(limit);
        
        if (news.length === 0) return [];

        // 2. Prepare data for AI
        const newsSummary = news.map(n => ({
            title: n.title,
            country: n.country,
            category: n.category,
            summary: n.summary,
            impact: n.impact_score
        }));

        const prompt = `Analyze the following global news data and identify the top 5 most pressing "Business Problems" or "Market Gaps" worldwide. 
For each problem, provide a "Strategic Solution" that an EdTech/LMS platform like AdaptIQ could implement (e.g., new course, tool, or service).

News Data:
${JSON.stringify(newsSummary, null, 2)}

Return a JSON array of objects:
{
  "insights": [
    {
      "region": "e.g., Southeast Asia",
      "problem": "Specific business or educational hurdle",
      "solution": "Actionable business solution",
      "impactScore": 0-100,
      "recommendedActions": ["action 1", "action 2"],
      "language": "Primary language for this region"
    }
  ]
}`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o', 
                messages: [
                    {
                        role: 'system',
                        content: 'You are a Global Business Intelligence Expert. Your goal is to turn news trends into actionable business opportunities for an international Learning Management System. Always return valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.5
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('Empty AI response');

            const result = JSON.parse(content);
            return result.insights || [];
        } catch (error) {
            console.error('InsightsEngine.analyzeGlobalProblems error:', error);
            return [];
        }
    },

    /**
     * Calculate performance metrics per language/locale.
     */
    async getLanguagePerformance(): Promise<LanguagePerformance[]> {
        const allNews = await NewsService.getRecentNews(200);
        
        const locales = ['en', 'es', 'hi', 'zh', 'ja', 'ko', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'ur', 'ms', 'id', 'tr', 'vi', 'bn', 'he'];
        
        const stats = locales.map(locale => {
            // In a real app, this would use Google Analytics or a DB log of events per locale.
            // For now, we simulate based on news region mapping and view counts.
            const localeNews = allNews.filter(n => this.mapCountryToLocale(n.country as string) === locale);
            
            const totalViews = localeNews.reduce((sum, n) => sum + (n.view_count || 0), 0);
            const volume = localeNews.length;

            return {
                locale,
                engagementScore: volume > 0 ? Math.round(totalViews / volume) : 0,
                contentVolume: volume,
                growthTrend: (volume > 5 ? 'increasing' : 'stable') as 'increasing' | 'stable' | 'decreasing'
            };
        });

        // Sort by engagement
        return stats.sort((a, b) => b.engagementScore - a.engagementScore);
    },

    /**
     * Helper to map country names to locales.
     */
    mapCountryToLocale(country: string): string {
        const map: Record<string, string> = {
            'USA': 'en', 'UK': 'en', 'Canada': 'en', 'Australia': 'en',
            'India': 'hi', 'Nepal': 'hi',
            'China': 'zh',
            'Japan': 'ja',
            'South Korea': 'ko',
            'Spain': 'es', 'Mexico': 'es', 'Brazil': 'pt',
            'France': 'fr', 'Germany': 'de', 'Italy': 'it',
            'Russia': 'ru',
            'Saudi Arabia': 'ar', 'UAE': 'ar', 'Egypt': 'ar',
            'Pakistan': 'ur',
            'Bangladesh': 'bn',
            'Israel': 'he',
            'Indonesia': 'id', 'Malaysia': 'ms', 'Turkey': 'tr', 'Vietnam': 'vi'
        };
        return map[country] || 'en';
    }
};
