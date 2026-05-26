import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ExternalIntegrationProvider,
    Integration,
    IntegrationKey,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
    secretLast4,
} from '@/shared/utils/integration-secret.util';
import { INTEGRATION_PROVIDERS } from './constants/integrations.constants';
import { CreateIntegrationKeyDto } from './dto/create-integration-key.dto';
import { UpdateIntegrationKeyDto } from './dto/update-integration-key.dto';
import {
    IntegrationKeyResponse,
    IntegrationResponse,
} from './interfaces/integration.interface';

@Injectable()
export class IntegrationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {}

    async findAll(user_uuid: string): Promise<IntegrationResponse[]> {
        const integrations = await this.prisma.integration.findMany({
            where: { user_uuid },
            include: {
                keys: { orderBy: { created_at: 'desc' } },
            },
        });
        const byProvider = new Map(
            integrations.map((row) => [row.provider, row]),
        );

        return INTEGRATION_PROVIDERS.map((provider) =>
            this.toIntegrationResponse(provider, byProvider.get(provider)),
        );
    }

    async createKey(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
        dto: CreateIntegrationKeyDto,
    ): Promise<IntegrationKeyResponse> {
        const integration = await this.ensureIntegration(user_uuid, provider);
        const encrypted = encryptIntegrationSecret(
            dto.secret.trim(),
            this.encryptionKey(),
        );
        const key = await this.prisma.integrationKey.create({
            data: {
                integration_uuid: integration.uuid,
                title: dto.title.trim(),
                secret: encrypted,
                last4: secretLast4(dto.secret),
            },
        });
        return this.toKeyResponse(key);
    }

    async updateKey(
        user_uuid: string,
        key_uuid: string,
        dto: UpdateIntegrationKeyDto,
    ): Promise<IntegrationKeyResponse> {
        if (dto.title === undefined && dto.secret === undefined) {
            throw new BadRequestException('No fields to update');
        }

        await this.requireOwnedKey(user_uuid, key_uuid);
        const data: { title?: string; secret?: string; last4?: string | null } =
            {};

        if (dto.title !== undefined) {
            data.title = dto.title.trim();
        }
        if (dto.secret !== undefined) {
            data.secret = encryptIntegrationSecret(
                dto.secret.trim(),
                this.encryptionKey(),
            );
            data.last4 = secretLast4(dto.secret);
        }

        const key = await this.prisma.integrationKey.update({
            where: { uuid: key_uuid },
            data,
        });
        return this.toKeyResponse(key);
    }

    async removeKey(
        user_uuid: string,
        key_uuid: string,
    ): Promise<{ uuid: string }> {
        await this.requireOwnedKey(user_uuid, key_uuid);
        await this.prisma.integrationKey.delete({ where: { uuid: key_uuid } });
        return { uuid: key_uuid };
    }

    async getDecryptedSecret(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
        key_uuid: string,
    ): Promise<string> {
        const key = await this.requireOwnedKey(user_uuid, key_uuid);
        if (key.integration.provider !== provider) {
            throw new NotFoundException('Integration key not found');
        }
        return decryptIntegrationSecret(key.secret, this.encryptionKey());
    }

    private async ensureIntegration(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
    ): Promise<Integration> {
        return this.prisma.integration.upsert({
            where: {
                user_uuid_provider: { user_uuid, provider },
            },
            create: {
                user_uuid,
                provider,
                title: this.defaultTitle(provider),
            },
            update: {},
        });
    }

    private async requireOwnedKey(
        user_uuid: string,
        key_uuid: string,
    ): Promise<IntegrationKey & { integration: Integration }> {
        const key = await this.prisma.integrationKey.findFirst({
            where: { uuid: key_uuid, integration: { user_uuid } },
            include: { integration: true },
        });
        if (!key) {
            throw new NotFoundException(`Integration key ${key_uuid} not found`);
        }
        return key;
    }

    private encryptionKey(): string {
        return (
            this.config.get<string>('INTEGRATIONS_ENCRYPTION_KEY') ??
            this.config.get<string>('JWT_SECRET') ??
            ''
        );
    }

    private defaultTitle(provider: ExternalIntegrationProvider): string {
        return provider
            .split('_')
            .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
            .join(' ');
    }

    private toIntegrationResponse(
        provider: ExternalIntegrationProvider,
        row?: Integration & { keys: IntegrationKey[] },
    ): IntegrationResponse {
        if (!row) {
            return { provider, uuid: null, title: null, keys: [] };
        }
        return {
            provider: row.provider,
            uuid: row.uuid,
            title: row.title,
            keys: row.keys.map((key) => this.toKeyResponse(key)),
        };
    }

    private toKeyResponse(key: IntegrationKey): IntegrationKeyResponse {
        return {
            uuid: key.uuid,
            title: key.title,
            last4: key.last4,
            created_at: key.created_at,
            updated_at: key.updated_at,
        };
    }
}
