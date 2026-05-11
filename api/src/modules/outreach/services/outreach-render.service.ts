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

    buildVarsForProfile(profile: SenderProfile | null | undefined): PlaceholderVars {
        return senderProfileToPlaceholders(profile);
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
}
