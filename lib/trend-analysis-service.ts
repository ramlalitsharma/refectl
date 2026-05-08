import { NewsDiscoveryService } from './news-discovery';
import { getOmniBrain } from './ai/omni-router';
import { getDatabase } from './mongodb';
import fs from 'fs';

export interface MarketInsight {
  topic: string;
  relevance_score: number;
  cpm_potential: 'High' | 'Medium' | 'Standard';
  keywords: string[];
  suggested_angle: string;
  source_news_title?: string;
}

const RESEARCH_STATE_PATH = 'market_research_state.json';

export const TrendAnalysisService = {
  /**
   * Performs deep market research by cross-referencing live news trends
   * with high-CPM commercial vectors using the Nvidia NIM neural matrix.
   */
  async performDeepResearch(): Promise<MarketInsight[]> {
    console.log('[Trend Analysis] Initiating Deep Market Research via Neural Matrix...');
    
    try {
      // 1. Fetch Live News Trends
      const newsTrends = await NewsDiscoveryService.getLiveTrends();
      if (newsTrends.length === 0) {
        console.warn('[Trend Analysis] No live trends discovered. Using baseline commercial vectors.');
        return this.getBaselineInsights();
      }

      // 2. Engaging NVIDIA NIM (via OmniBrain) for Strategic Analysis
      const brain = getOmniBrain();
      const analysisPrompt = `
        You are a Senior Market Research Analyst and SEO Strategist for a world-class intelligence platform.
        Analyze the following news headlines and identify the top 5 most commercially viable "High-CPM" blog topics.
        
        Focus Categories: 
        - Education & Learning (EdTech, Pedagogy, Government Exams, Study Trends)
        - Information Technology (Cloud, Cybersecurity, Software Architecture, IT Infrastructure)
        - Business & Finance (Market Analysis, Venture Capital, Fintech, Global Economy)
        - Industry & Innovation (Manufacturing, Supply Chain, Green Energy, Industrial AI)
        - Artificial Intelligence (LLMs, Neural Networks, AI Policy, Automation)
        - Institutional Intelligence (University Research, Government Policy, NGO Movements)
        
        Headlines:
        ${newsTrends.map(t => `- ${t.title}`).join('\n')}
        
        For each topic, provide:
        - topic: Engaging, SEO-optimized title.
        - relevance_score: 0-100 based on current news volume.
        - cpm_potential: High, Medium, or Standard.
        - keywords: 5-7 high-value SEO keywords.
        - suggested_angle: The unique perspective we should take.
        
        Return ONLY a valid JSON object with an "insights" array.
      `;

      const response = await brain.invoke(analysisPrompt);
      const insights: MarketInsight[] = JSON.parse(response).insights || [];
      
      // 3. Save Research State
      fs.writeFileSync(RESEARCH_STATE_PATH, JSON.stringify(insights, null, 2));
      console.log(`[Trend Analysis] Research complete. ${insights.length} strategic insights identified.`);
      
      return insights;
    } catch (error) {
      console.error('[Trend Analysis] Research cycle failed:', error);
      return this.getBaselineInsights();
    }
  },

  async getLatestInsights(): Promise<MarketInsight[]> {
    if (fs.existsSync(RESEARCH_STATE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(RESEARCH_STATE_PATH, 'utf8'));
      } catch (e) {
        return this.getBaselineInsights();
      }
    }
    return this.performDeepResearch();
  },

  getBaselineInsights(): MarketInsight[] {
    return [
      {
        topic: "The Future of AI-Driven Financial Markets in 2026",
        relevance_score: 95,
        cpm_potential: 'High',
        keywords: ['AI finance', 'market trends 2026', 'algorithmic trading', 'fintech innovation'],
        suggested_angle: "Focus on how Nvidia NIM and high-performance computing are restructuring global trade."
      },
      {
        topic: "Geopolitical Impacts of Green Energy Sovereignty",
        relevance_score: 88,
        cpm_potential: 'Medium',
        keywords: ['green energy', 'geopolitics', 'energy security', 'renewable transition'],
        suggested_angle: "Analyze how regional autonomy in energy is shifting power away from traditional oil states."
      }
    ];
  }
};
