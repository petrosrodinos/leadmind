import { Injectable } from '@nestjs/common';
import { SenderProfile } from '@/generated/prisma';
import {
    renderPlaceholders,
    type PlaceholderVars,
} from '@/shared/utils/placeholder-render.util';
import { SenderProfilesService } from '@/modules/sender-profiles/sender-profiles.service';
import { senderProfileToPlaceholders } from '@/modules/sender-profiles/utils/sender-profile-placeholders.util';

export interface RenderableMessage {
    subject?: string | null;
    content: string;
}

export interface RenderedMessage {
    subject: string | null;
    content: string;
}

@Injectable()
export class OutreachRenderService {
    constructor(private readonly senderProfilesService: SenderProfilesService) { }

    async buildVarsForUser(user_uuid: string): Promise<PlaceholderVars> {
        const profile = await this.senderProfilesService.findDefault(user_uuid);
        return this.buildVarsForProfile(profile);
    }

    buildVarsForProfile(
        profile: SenderProfile | null | undefined,
        options?: { campaignUuid?: string | null },
    ): PlaceholderVars {
        return senderProfileToPlaceholders(profile, options);
    }

    async buildVarsForOutreachMessage(
        user_uuid: string,
        campaign_uuid?: string | null,
    ): Promise<PlaceholderVars> {
        const profile = campaign_uuid
            ? await this.senderProfilesService.findForCampaign(user_uuid, campaign_uuid)
            : await this.senderProfilesService.findDefault(user_uuid);
        return senderProfileToPlaceholders(profile, { campaignUuid: campaign_uuid });
    }

    render(message: RenderableMessage, vars: PlaceholderVars): RenderedMessage {
        return {
            subject: message.subject ? renderPlaceholders(message.subject, vars) : null,
            content: renderPlaceholders(message.content, vars),
        };
    }

    async renderForUser(user_uuid: string, message: RenderableMessage): Promise<RenderedMessage> {
        const vars = await this.buildVarsForUser(user_uuid);
        return this.render(message, vars);
    }

    async renderForOutreachMessage(
        user_uuid: string,
        message: RenderableMessage & { campaign_uuid?: string | null },
    ): Promise<RenderedMessage> {
        const vars = await this.buildVarsForOutreachMessage(user_uuid, message.campaign_uuid);
        return this.render(message, vars);
    }
}
