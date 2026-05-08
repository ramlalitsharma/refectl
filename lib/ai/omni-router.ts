import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export class OmniRouter {
  private fallbacks: BaseChatModel[] = [];

  constructor() {
    const defaultHeaders = {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Terai Times Autonomous Cofounder",
    };

    // 1. Premium NVIDIA NIM (Llama 3 70B)
    if (process.env.NVIDIA_API_KEY) {
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        configuration: { baseURL: 'https://integrate.api.nvidia.com/v1' },
        modelName: 'meta/llama3-70b-instruct',
        temperature: 0.7,
        maxRetries: 1,
      }));
    }

    if (process.env.OPENROUTER_API_KEY) {
      // 2. OpenRouter Premium (Llama 3 70B)
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: { baseURL: 'https://openrouter.ai/api/v1', defaultHeaders },
        modelName: 'meta-llama/llama-3-70b-instruct',
        temperature: 0.7,
        maxRetries: 1,
      }));

      // 3. OpenRouter FREE TIER A: Llama 3 8B Free
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: { baseURL: 'https://openrouter.ai/api/v1', defaultHeaders },
        modelName: 'meta-llama/llama-3-8b-instruct:free',
        temperature: 0.7,
        maxRetries: 1,
      }));

      // 4. OpenRouter FREE TIER B: Mistral 7B Free
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: { baseURL: 'https://openrouter.ai/api/v1', defaultHeaders },
        modelName: 'mistralai/mistral-7b-instruct:free',
        temperature: 0.7,
        maxRetries: 1,
      }));

      // 5. OpenRouter FREE TIER C: Google Gemma Free
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: { baseURL: 'https://openrouter.ai/api/v1', defaultHeaders },
        modelName: 'google/gemma-7b-it:free',
        temperature: 0.7,
        maxRetries: 1,
      }));
    }

    if (process.env.OPENAI_API_KEY) {
      // 6. Final Fallback: OpenAI GPT-4o-mini
      this.fallbacks.push(new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        maxRetries: 1,
      }));
    }
  }

  async invoke(prompt: string): Promise<string> {
    if (this.fallbacks.length === 0) {
      throw new Error('[OmniRouter] FATAL: No API keys found in .env.local!');
    }

    console.log(`[OmniRouter] Engaging Neural Matrix. ${this.fallbacks.length} models available.`);

    for (let i = 0; i < this.fallbacks.length; i++) {
      const model = this.fallbacks[i];
      try {
        console.log(`[OmniRouter] Attempting Model Slot #${i + 1}...`);
        const response = await model.invoke(prompt);
        console.log(`[OmniRouter] Success on Model Slot #${i + 1}!`);
        return response.content as string;
      } catch (error: any) {
        console.warn(`[OmniRouter] Model Slot #${i + 1} Failed (${error.message}). Cascading to next free/premium model...`);
        continue;
      }
    }
    
    throw new Error('[OmniRouter] TOTAL FAILURE: All free and premium neural networks exhausted.');
  }
}

export function getOmniBrain() {
  return new OmniRouter();
}
