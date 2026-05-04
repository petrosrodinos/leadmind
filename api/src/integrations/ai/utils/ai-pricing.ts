import { AiProviders, AiModels } from '../interfaces/ai.interface';

export const AiPricing = {
    [AiProviders.openai]: {
        [AiModels.openai.gpt4o]: { input: 0.00001, output: 0.00003 },
        [AiModels.openai.gpt4oMini]: { input: 0.000005, output: 0.000015 },
        [AiModels.openai.gpt4Turbo]: { input: 0.00001, output: 0.00003 },
        [AiModels.openai.gpt4]: { input: 0.000012, output: 0.00004 },
        [AiModels.openai.gpt35Turbo]: { input: 0.0000015, output: 0.000002 },
    },

    [AiProviders.grok]: {
        [AiModels.grok.grokPro]: { input: 0.00002, output: 0.00004 },
        [AiModels.grok.grokBeta]: { input: 0.000015, output: 0.00003 },
    },

    [AiProviders.gemini]: {
        [AiModels.gemini.gemini15Pro]: { input: 0.000009, output: 0.000027 },
        [AiModels.gemini.gemini15Flash]: { input: 0.000003, output: 0.000006 },
        [AiModels.gemini.geminiPro]: { input: 0.000008, output: 0.00002 },
        [AiModels.gemini.geminiProVision]: { input: 0.000008, output: 0.00002 },
    },
} as const;
