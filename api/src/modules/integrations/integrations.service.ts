import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ExternalIntegrationProvider,
    Integration,
    IntegrationKey,
    IntegrationKeyType,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
    secretLast4,
} from '@/shared/utils/integration-secret.util';
import {
    DISABLED_INTEGRATION_PROVIDERS,
    INTEGRATION_PROVIDER_DESCRIPTIONS,
    INTEGRATION_PROVIDER_LABELS,
    INTEGRATION_PROVIDERS,
} from './constants/integrations.constants';
import {
    formatIntegrationKeyEnvName,
    isKeyTypeAllowedForProvider,
    KEY_TYPE_LABELS,
    KEY_TYPE_PLACEHOLDERS,
    PROVIDER_KEY_TYPES,
} from './constants/integration-key-types.constants';
import { CreateIntegrationKeyDto } from './dto/create-integration-key.dto';
import { UpdateIntegrationKeyDto } from './dto/update-integration-key.dto';
import {
    IntegrationKeyResponse,
    IntegrationKeyTypeOption,
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
                keys: {
                    orderBy: [{ account: 'asc' }, { key_type: 'asc' }],
                },
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
        if (DISABLED_INTEGRATION_PROVIDERS.includes(provider)) {
            throw new BadRequestException(
                `${INTEGRATION_PROVIDER_LABELS[provider]} integration is not available yet`,
            );
        }

        if (!isKeyTypeAllowedForProvider(provider, dto.key_type)) {
            throw new BadRequestException(
                `Key type ${dto.key_type} is not supported for ${provider}`,
            );
        }

        const account = dto.account.trim();
        const integration = await this.ensureIntegration(user_uuid, provider);

        try {
            const key = await this.prisma.integrationKey.create({
                data: {
                    integration_uuid: integration.uuid,
                    key_type: dto.key_type,
                    account,
                    secret: encryptIntegrationSecret(
                        dto.secret.trim(),
                        this.encryptionKey(),
                    ),
                    last4: secretLast4(dto.secret),
                },
            });
            return this.toKeyResponse(key, provider);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    `${formatIntegrationKeyEnvName(provider, dto.key_type, account)} already exists`,
                );
            }
            throw error;
        }
    }

    async updateKey(
        user_uuid: string,
        key_uuid: string,
        dto: UpdateIntegrationKeyDto,
    ): Promise<IntegrationKeyResponse> {
        const owned = await this.requireOwnedKey(user_uuid, key_uuid);
        const key = await this.prisma.integrationKey.update({
            where: { uuid: key_uuid },
            data: {
                secret: encryptIntegrationSecret(
                    dto.secret.trim(),
                    this.encryptionKey(),
                ),
                last4: secretLast4(dto.secret),
            },
        });
        return this.toKeyResponse(key, owned.integration.provider);
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
        key_type: IntegrationKeyType,
        account: string,
    ): Promise<string> {
        const integration = await this.prisma.integration.findUnique({
            where: { user_uuid_provider: { user_uuid, provider } },
        });
        if (!integration) {
            throw new NotFoundException(
                `Credential ${formatIntegrationKeyEnvName(provider, key_type, account)} not found`,
            );
        }

        const key = await this.prisma.integrationKey.findUnique({
            where: {
                integration_uuid_key_type_account: {
                    integration_uuid: integration.uuid,
                    key_type,
                    account: account.trim(),
                },
            },
        });
        if (!key) {
            throw new NotFoundException(
                `Credential ${formatIntegrationKeyEnvName(provider, key_type, account)} not found`,
            );
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
                title: INTEGRATION_PROVIDER_LABELS[provider],
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
        const key =
            this.config.get<string>('INTEGRATIONS_ENCRYPTION_KEY') ??
            this.config.get<string>('JWT_SECRET');
        if (!key) {
            throw new BadRequestException(
                'Integration encryption is not configured on the server',
            );
        }
        return key;
    }

    private keyTypeOptions(
        provider: ExternalIntegrationProvider,
    ): IntegrationKeyTypeOption[] {
        return PROVIDER_KEY_TYPES[provider].map((key_type) => ({
            key_type,
            label: KEY_TYPE_LABELS[key_type],
            placeholder: KEY_TYPE_PLACEHOLDERS[key_type],
        }));
    }

    private toIntegrationResponse(
        provider: ExternalIntegrationProvider,
        row?: Integration & { keys: IntegrationKey[] },
    ): IntegrationResponse {
        return {
            provider,
            uuid: row?.uuid ?? null,
            label: INTEGRATION_PROVIDER_LABELS[provider],
            description: INTEGRATION_PROVIDER_DESCRIPTIONS[provider],
            disabled: DISABLED_INTEGRATION_PROVIDERS.includes(provider),
            keyTypes: this.keyTypeOptions(provider),
            keys: (row?.keys ?? []).map((key) => this.toKeyResponse(key, provider)),
        };
    }

    private toKeyResponse(
        key: IntegrationKey,
        provider: ExternalIntegrationProvider,
    ): IntegrationKeyResponse {
        return {
            uuid: key.uuid,
            key_type: key.key_type,
            account: key.account,
            label: KEY_TYPE_LABELS[key.key_type],
            env_name: formatIntegrationKeyEnvName(
                provider,
                key.key_type,
                key.account,
            ),
            last4: key.last4,
            created_at: key.created_at,
            updated_at: key.updated_at,
        };
    }
}

