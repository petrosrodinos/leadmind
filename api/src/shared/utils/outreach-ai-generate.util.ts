import { Channel } from '@/generated/prisma';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { sanitizeEmailHtml } from './sanitize-html.util';
import { buildCampaignPrompt } from '@/modules/marketing-campaigns/constants/campaign-prompts';
import { CampaignAiAction } from '@/modules/marketing-campaigns/dto/generate-campaign-message.dto';

export interface OutreachAiGenerateContext {
    sender_business_description?: string;
    campaign_name?: string;
    campaign_description?: string;
    user_prompt?: string;
    current_subject?: string;
    current_content?: string;
    language?: string;
}

export async function generateWithCampaignPrompt(
    aiService: AiService,
    channel: Channel,
    action: CampaignAiAction,
    ctx: OutreachAiGenerateContext,
): Promise<{ subject: string | null; content: string }> {
    const { prompt, system } = buildCampaignPrompt(channel, action, ctx);
    const { response } = await aiService.generateText({
        provider: AiProviders.openai,
        model: channel === Channel.EMAIL ? AiModels.openai.gpt4o : AiModels.openai.gpt4oMini,
        prompt,
        system,
    });
    if (channel === Channel.EMAIL) {
        const parsed = parseEmailDraft(response);
        return { subject: parsed.subject, content: sanitizeEmailHtml(parsed.content) };
    }
    return { subject: null, content: response.trim() };
}

export function parseEmailDraft(raw: string): { subject: string | null; content: string } {
    const match = raw.match(/^\s*(?:<[^>]+>\s*)*Subject:\s*(.+?)(?:<\/[^>]+>)?\s*$/im);
    if (!match) return { subject: null, content: raw.trim() };
    const subject = match[1].replace(/<[^>]*>/g, '').trim();
    const body = raw.replace(match[0], '').trim();
    return { subject, content: body };
}
