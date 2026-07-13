import { Injectable } from '@nestjs/common';
import { AiService } from '@/integrations/ai/services/ai.service';
import { GenerateTemplateMessageDto } from '../dto/generate-template-message.dto';
import { generateWithCampaignPrompt } from '@/shared/utils/outreach-ai-generate.util';

@Injectable()
export class TemplateAiService {
    constructor(private readonly aiService: AiService) {}

    generate(
        user_uuid: string,
        dto: GenerateTemplateMessageDto,
        ctx: { template_name?: string },
    ): Promise<{ subject: string | null; content: string }> {
        return generateWithCampaignPrompt(this.aiService, user_uuid, dto.channel, dto.action, {
            campaign_name: ctx.template_name,
            user_prompt: dto.prompt,
            current_subject: dto.current_subject,
            current_content: dto.current_content,
            language: dto.language,
        });
    }
}
