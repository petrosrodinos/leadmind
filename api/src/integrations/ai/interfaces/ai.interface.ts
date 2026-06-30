import { z } from 'zod';

export interface AiUsageContext {
    operation?: string;
    request_mode?: 'SYNC' | 'BATCH' | 'STREAM';
    reference_type?: string;
    reference_uuid?: string;
    batch_id?: string;
    custom_id?: string;
    metadata?: Record<string, unknown>;
}

export interface AIGenerateOptions {
    user_uuid: string;
    provider?: AiProvider;
    model?: AiModel;
    system?: string;
    prompt: string;
    usage?: AiUsageContext;
    schema?: z.ZodSchema;
    output?: 'json' | 'no-schema';
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface AIWebSearchSource {
    type: string;
    url?: string;
    title?: string;
}

export interface AIGenerateTextResponse {
    response: string;
    usage?: AICostResponse;
    sources?: AIWebSearchSource[];
}

export interface AIGenerateObjectResponse {
    response: z.ZodSchema[] | null;
    usage?: AICostResponse
}



export interface AIStreamTextOptions extends AIGenerateOptions {
    onToken?: (token: string) => void;
    onComplete?: (fullText: string) => void;
}

export interface AIModelInfo {
    provider: AiProvider;
    model: AiModel;
}

export interface AICost {
    provider?: AiProvider,
    model?: AiModel,
    inputTokens: number,
    outputTokens: number,
}

export interface AICostResponse {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputRate: number;
    outputRate: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
}

export const AiProviders = {
    openai: 'openai',
    grok: 'grok',
    gemini: 'gemini',
    perplexity: 'perplexity',
    claude: 'claude',
} as const;

export const AiModels = {
    openai: {
        gpt4o: 'gpt-4o',
        gpt4oMini: 'gpt-4o-mini',
        gpt4Turbo: 'gpt-4-turbo',
        gpt4: 'gpt-4',
        gpt35Turbo: 'gpt-3.5-turbo',
    },
    grok: {
        grokBeta: 'grok-beta',
        grokPro: 'grok-pro',
    },
    gemini: {
        geminiPro: 'gemini-pro',
        geminiProVision: 'gemini-pro-vision',
        gemini15Pro: 'gemini-1.5-pro',
        gemini15Flash: 'gemini-1.5-flash',
    },
    perplexity: {
        sonar: 'sonar',
        sonarPro: 'sonar-pro',
    },
    claude: {
        sonnet: 'claude-sonnet-4-6',
        haiku: 'claude-haiku-4-5',
    },
};

export type AiProvider = typeof AiProviders[keyof typeof AiProviders];
export type AiModel = string;


