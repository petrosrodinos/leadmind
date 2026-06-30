import { Injectable } from '@nestjs/common';
import { Channel } from '@/generated/prisma';
import { AiService } from '@/integrations/ai/services/ai.service';
import { GenerateCampaignMessageDto } from '../dto/generate-campaign-message.dto';
import { generateWithCampaignPrompt } from '@/shared/utils/outreach-ai-generate.util';

@Injectable()
export class CampaignAiService {
    constructor(private readonly aiService: AiService) {}

    generate(
        user_uuid: string,
        dto: GenerateCampaignMessageDto,
        ctx: {
            campaign_name?: string;
            campaign_description?: string;
            sender_business_description?: string;
        },
    ): Promise<{ subject: string | null; content: string }> {
        return generateWithCampaignPrompt(this.aiService, user_uuid, dto.channel, dto.action, {
            campaign_name: ctx.campaign_name,
            campaign_description: ctx.campaign_description,
            sender_business_description: ctx.sender_business_description,
            user_prompt: dto.prompt,
            current_subject: dto.current_subject,
            current_content: dto.current_content,
            language: dto.language,
        });
    }
}
