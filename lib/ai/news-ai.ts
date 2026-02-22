import { openai } from '@/lib/openai';
import { DRAFT_PROMPT } from './prompts/draft';
import { CONTEXT_PROMPT } from './prompts/context';
import { STRATEGY_PROMPT } from './prompts/strategy';
import { MultiAgentOrchestrator } from './ai-orchestrator';

import { uploadImageFromUrl } from '../supabase-storage';

export interface NewsDraftResult {
    print_headline: string;
    digital_headline: string;
    subheadline: string;
    executive_summary: string;
    body: string;
    suggested_tier: string;
    cover_image?: string; // New: AI-generated or fallbacked
}

export interface ContextBriefResult {
    background: string;
    key_players: string;
    whats_new: string;
    why_it_matters: string;
}

export interface EditorialStrategyResult {
    editorial_summary: string;
    operational_tags: string[];
    internal_linking: string[];
    headline_variants: {
        print: string;
        digital: string;
    };
    meta_description: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    market_entities: string[];
    impact_score: number;
}

export const NewsAIService = {
    /**
     * Generates a high-level editorial draft from a topic.
     * Delegates to MultiAgentOrchestrator for zero-cost swarm intelligence.
     */
    generateNewsDraft: async (params: {
        topic: string;
        region: string;
        tone: 'Neutral' | 'Investigative' | 'Analytical';
        depth: 'Brief' | 'Standard' | 'Longform';
        sourceMaterial?: string;
    }): Promise<NewsDraftResult> => {
        try {
            console.log('[NewsAIService] Delegating Draft to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runAuthorAgent({
                topic: params.topic,
                region: params.region,
                sourceMaterial: params.sourceMaterial
            });
        } catch (error) {
            console.warn('[NewsAIService] Swarm Draft failed. Using Sanitizer fallback.');
            return NewsAIService.generateDeterministicDraft(params);
        }
    },

    /**
     * Generates a concise context brief for editors.
     */
    generateContextBrief: async (topic: string): Promise<ContextBriefResult> => {
        try {
            console.log('[NewsAIService] Delegating Brief to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runResearcherAgent(topic);
        } catch (error) {
            console.warn('[NewsAIService] Swarm Brief failed. Returning generic context.');
            return {
                background: `Global background assessment for ${topic}.`,
                key_players: "International actors and regional interests.",
                whats_new: "Real-time movements identified by intelligence network.",
                why_it_matters: "Significant impact on regional stability and global markets."
            };
        }
    },

    /**
     * Analyzes content to generate editorial and SEO strategy.
     */
    generateEditorialStrategy: async (content: string, title?: string): Promise<EditorialStrategyResult> => {
        try {
            console.log('[NewsAIService] Delegating Strategy to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runEditorAgent(content, title || 'Unspecified Article');
        } catch (error) {
            console.warn('[NewsAIService] Swarm Strategy failed. Using Sanitizer fallback.');
            return NewsAIService.generateDeterministicStrategy(content, title || 'Unspecified', 'World');
        }
    },

    /**
     * Phase 27, 28, 29 & 34: Global Swarm Intelligence Switchboard
     * Orchestrates failover and now incorporates the Artist Agent for legal imagery.
     */
    generateNewsDraftHybrid: async (params: {
        topic: string;
        region: string;
        tone: 'Neutral' | 'Investigative' | 'Analytical';
        depth: 'Brief' | 'Standard' | 'Longform';
        sourceMaterial?: string;
        generateImage?: boolean; // New: Command to generate AI art
    }): Promise<{ draft: NewsDraftResult; strategy: EditorialStrategyResult; mode: 'Multi-Agent-Elite' | 'Multi-Agent' | 'AI' | 'Sanitized' }> => {

        // 1. Try The Global Swarm Intelligence Hub (Agentic Refinement Loop)
        try {
            console.log('[AI Switchboard] Level 1: Initializing Global Swarm Intelligence...');

            // Step A: Initial Draft (Author Agent)
            const initialDraft = await MultiAgentOrchestrator.runAuthorAgent({
                topic: params.topic,
                region: params.region,
                sourceMaterial: params.sourceMaterial
            });

            // Step B & C (Critique/Refine) ... as before
            let finalDraft = initialDraft;
            let mode: any = 'Multi-Agent';

            try {
                console.log('[AI Switchboard] Level 1: Subjecting manuscript to elite peer-review...');
                const critique = await MultiAgentOrchestrator.runCriticAgent(initialDraft, params.sourceMaterial || 'N/A');

                if (critique.quality_score < 90 || critique.hallucinations.length > 0) {
                    console.log('[AI Switchboard] Level 1: Peer-review identified improvements. Polishing manuscript...');
                    finalDraft = await MultiAgentOrchestrator.runRefinerAgent(initialDraft, critique.feedback);
                    mode = 'Multi-Agent-Elite';
                }
            } catch (critiqueError) {
                console.warn('[AI Switchboard] Level 1 Critique/Refiner failed. Proceeding with initial draft.', critiqueError);
            }

            // Step D: Professional Metadata (Editor Agent)
            const strategy = await MultiAgentOrchestrator.runEditorAgent(finalDraft.body || 'Synthetic knowledge gathering in progress.', finalDraft.print_headline || params.topic);

            // Phase 34: Artist Agent (Legal Media)
            if (params.generateImage) {
                try {
                    console.log('[AI Switchboard] Phase 34: Activating Artist Agent for legal imagery...');
                    const tempImageUrl = await MultiAgentOrchestrator.runArtistAgent(finalDraft.print_headline || params.topic, finalDraft.executive_summary || 'Global Intelligence Summary');
                    if (tempImageUrl) {
                        const persistedUrl = await uploadImageFromUrl(tempImageUrl);
                        if (persistedUrl) finalDraft.cover_image = persistedUrl;
                    }
                } catch (artistError) {
                    console.warn('[AI Switchboard] Artist Agent failed. Falling back to default thumbnails.', artistError);
                }
            }

            return { draft: finalDraft, strategy, mode };

        } catch (multiAgentError) {
            console.warn('[AI Switchboard] Multi-Agent Path failed. Falling back to OpenAI.');
            // ... existing fallback logic ...
            try {
                const draft = await NewsAIService.generateNewsDraft(params);
                const strategy = await NewsAIService.generateEditorialStrategy(draft.body, draft.print_headline);

                // Artist Agent in OpenAI Fallback too
                if (params.generateImage) {
                    const tempImageUrl = await MultiAgentOrchestrator.runArtistAgent(draft.print_headline, draft.executive_summary);
                    if (tempImageUrl) {
                        const persistedUrl = await uploadImageFromUrl(tempImageUrl);
                        if (persistedUrl) draft.cover_image = persistedUrl;
                    }
                }

                return { draft, strategy, mode: 'AI' };
            } catch (openaiError: any) {
                console.warn('[AI Switchboard] OpenAI Path Failed. Activating Sanitizer Failover.', openaiError.message);
                const draft = NewsAIService.generateDeterministicDraft(params);
                const strategy = NewsAIService.generateDeterministicStrategy(draft.body, draft.print_headline, params.topic);
                return { draft, strategy, mode: 'Sanitized' };
            }
        }
    },

    /**
     * Phase 27: Deterministic Sanitizer (Zero-AI Cost)
     * Structurally formats scraped source material into a professional report without external API calls.
     */
    generateDeterministicDraft: (params: {
        topic: string;
        region: string;
        sourceMaterial?: string;
    }): NewsDraftResult => {
        const headline = params.topic.replace('Latest insights regarding ', '').replace(' news in ', ': ');
        const sanitizedBody = params.sourceMaterial
            ? params.sourceMaterial
                .replace(/TARGETED NEWS BRIEFING FOR.*?\n\n/, '')
                .replace(/Title: /g, '### ')
                .replace(/Context: /g, '\n\n')
                .replace(/---/g, '\n\n')
            : 'No direct source material available for this briefing.';

        return {
            print_headline: headline,
            digital_headline: `Intelligence Report: ${headline}`,
            subheadline: `Verified updates spanning ${params.region} and surrounding markets.`,
            executive_summary: `Autonomous intelligence gathering has identified key movements regarding ${headline}. This synthesized report provides raw factual anchors retrieved from verified global sources.`,
            body: `## Intelligence Briefing\n\n${sanitizedBody}\n\n--- \n\n*This report was synthesized using the Terai Times Deterministic Sanitizer protocol.*`,
            suggested_tier: 'Standard'
        };
    },

    /**
     * Phase 27: Deterministic Strategy Fallback
     */
    generateDeterministicStrategy: (content: string, title: string, topic: string): EditorialStrategyResult => {
        const categories = ['Finance', 'Tech', 'Politics', 'Business', 'World', 'Culture', 'Science', 'Health'];
        const detectedTag = categories.find(c => topic.toLowerCase().includes(c.toLowerCase())) || 'World';

        return {
            editorial_summary: `Automated summary of movements regarding ${title}.`,
            operational_tags: [detectedTag, 'Automated', 'Intelligence', 'Global'],
            internal_linking: [],
            headline_variants: { print: title, digital: `Deep Dive: ${title}` },
            meta_description: `Latest intelligence and verified movements regarding ${title}. Reported by Terai Times.`,
            sentiment: 'Neutral',
            market_entities: [],
            impact_score: 50
        };
    }
};
