import { AiPricing } from './ai-pricing';
import { AICost, AICostResponse, AiModels, AiProviders } from '../interfaces/ai.interface';


export function calculateAiCost(cost: AICost): AICostResponse {

    const { provider, model, inputTokens, outputTokens } = cost;

    const providerPricing = AiPricing[provider ?? AiProviders.openai];

    if (!providerPricing) {
        throw new Error(`Unknown provider: ${provider}`);
    }

    const modelPricing = providerPricing[model ?? AiModels.openai.gpt4o];

    if (!modelPricing) {
        throw new Error(`Unknown model: ${model} for provider: ${provider}`);
    }

    const inputRate = modelPricing.input;
    const outputRate = modelPricing.output;

    const inputCost = (inputTokens ?? 0) * inputRate;
    const outputCost = (outputTokens ?? 0) * outputRate;

    return {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        inputRate,
        outputRate,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
    };
}

export function estimateWordsFromPrice(price: number): number {

    const WORDS_PER_TOKEN = 0.75;

    const providerPricing = AiPricing[AiProviders.openai];
    const modelPricing = providerPricing[AiModels.openai.gpt4o];

    const avgTokenCost = (modelPricing.input + modelPricing.output) / 2;

    const totalTokens = price / avgTokenCost;

    const estimatedWords = totalTokens * WORDS_PER_TOKEN;

    return Math.floor(estimatedWords);
}
