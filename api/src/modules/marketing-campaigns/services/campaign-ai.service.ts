import { Injectable } from '@nestjs/common';
import { Channel } from '@/generated/prisma';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { GenerateCampaignMessageDto } from '../dto/generate-campaign-message.dto';
import { buildCampaignPrompt } from '../constants/campaign-prompts';

@Injectable()
export class CampaignAiService {
    constructor(private readonly aiService: AiService) { }

    async generate(
        dto: GenerateCampaignMessageDto,
        ctx: { campaign_name?: string; campaign_description?: string },
    ): Promise<{ subject: string | null; content: string }> {
        const { prompt, system } = buildCampaignPrompt(dto.channel, dto.action, {
            campaign_name: ctx.campaign_name,
            campaign_description: ctx.campaign_description,
            user_prompt: dto.prompt,
            current_subject: dto.current_subject,
            current_content: dto.current_content,
            language: dto.language,
        });

        const { response } = await this.aiService.generateText({
            provider: AiProviders.openai,
            model: dto.channel === Channel.EMAIL ? AiModels.openai.gpt4o : AiModels.openai.gpt4oMini,
            prompt,
            system,
        });

        if (dto.channel === Channel.EMAIL) {
            const parsed = parseEmailDraft(response);
            return { subject: parsed.subject, content: sanitizeEmailHtml(parsed.content) };
        }
        return { subject: null, content: response.trim() };
    }
}

function parseEmailDraft(raw: string): { subject: string | null; content: string } {
    const match = raw.match(/^\s*(?:<[^>]+>\s*)*Subject:\s*(.+?)(?:<\/[^>]+>)?\s*$/im);
    if (!match) {
        return { subject: null, content: raw.trim() };
    }
    const subject = match[1].replace(/<[^>]*>/g, '').trim();
    const body = raw.replace(match[0], '').trim();
    return { subject, content: body };
}
