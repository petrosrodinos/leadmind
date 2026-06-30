import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    ExternalIntegrationProvider,
    IntegrationKeyType,
} from '@/generated/prisma';
import { IntegrationsService } from '@/modules/integrations/integrations.service';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

const OPENAI_ACCOUNT = '1';

@Injectable()
export class AiCredentialsService {
    constructor(
        private readonly integrationsService: IntegrationsService,
        private readonly prisma: PrismaService,
    ) {}

    async hasOpenAiApiKey(user_uuid: string): Promise<boolean> {
        const key = await this.prisma.integrationKey.findFirst({
            where: {
                key_type: IntegrationKeyType.API_KEY,
                account: OPENAI_ACCOUNT,
                integration: {
                    user_uuid,
                    provider: ExternalIntegrationProvider.OPENAI,
                },
            },
            select: { uuid: true },
        });
        return Boolean(key);
    }

    async getOpenAiApiKey(user_uuid: string): Promise<string> {
        return this.integrationsService.getDecryptedSecret(
            user_uuid,
            ExternalIntegrationProvider.OPENAI,
            IntegrationKeyType.API_KEY,
            OPENAI_ACCOUNT,
        );
    }

    async getOpenAiWebhookSecret(user_uuid: string): Promise<string> {
        return this.integrationsService.getDecryptedSecret(
            user_uuid,
            ExternalIntegrationProvider.OPENAI,
            IntegrationKeyType.WEBHOOK_SECRET,
            OPENAI_ACCOUNT,
        );
    }

    async assertOpenAiConfigured(user_uuid: string): Promise<void> {
        const configured = await this.hasOpenAiApiKey(user_uuid);
        if (!configured) {
            throw new BadRequestException(
                'OpenAI is not configured. Add your OpenAI API key under Integrations.',
            );
        }
    }

    async tryGetOpenAiWebhookSecret(user_uuid: string): Promise<string | null> {
        try {
            return await this.getOpenAiWebhookSecret(user_uuid);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return null;
            }
            throw error;
        }
    }
}
