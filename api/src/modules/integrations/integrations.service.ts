import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
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
    listDistinctIntegrationAccounts,
    PROVIDER_KEY_TYPES,
    providerAllowsMultipleAccounts,
    providerSupportsDefaultAccountSelection,
    resolveEffectiveDefaultAccount,
    shouldExposeIntegrationKeyDisplayValue,
    suggestNextIntegrationAccount,
} from './constants/integration-key-types.constants';
import { CreateIntegrationKeyDto } from './dto/create-integration-key.dto';
import { CreateSmtpAccountDto } from './dto/create-smtp-account.dto';
import { SetDefaultIntegrationAccountDto } from './dto/set-default-integration-account.dto';
import { UpdateIntegrationKeyDto } from './dto/update-integration-key.dto';
import {
    IntegrationKeyResponse,
    IntegrationKeyTypeOption,
    IntegrationResponse,
} from './interfaces/integration.interface';
@Injectable()
export class IntegrationsService {
    private readonly logger = new Logger(IntegrationsService.name);

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

        const allowsMultipleAccounts = providerAllowsMultipleAccounts(provider);
        const account = allowsMultipleAccounts ? dto.account.trim() : '1';

        if (!allowsMultipleAccounts && dto.account.trim() !== '1') {
            throw new BadRequestException(
                `${INTEGRATION_PROVIDER_LABELS[provider]} supports only one credential set`,
            );
        }

        const integration = await this.ensureIntegration(user_uuid, provider);
        const integrationWithKeys = await this.prisma.integration.findUnique({
            where: { uuid: integration.uuid },
            include: { keys: true },
        });
        const existingKeys = integrationWithKeys?.keys ?? [];

        if (!allowsMultipleAccounts) {
            const existing = await this.prisma.integrationKey.findFirst({
                where: {
                    integration_uuid: integration.uuid,
                    key_type: dto.key_type,
                },
            });
            if (existing) {
                throw new ConflictException(
                    `${KEY_TYPE_LABELS[dto.key_type]} is already configured for ${INTEGRATION_PROVIDER_LABELS[provider]}. Update the existing key instead.`,
                );
            }
        } else {
            const existingForAccount =
                await this.prisma.integrationKey.findUnique({
                    where: {
                        integration_uuid_key_type_account: {
                            integration_uuid: integration.uuid,
                            key_type: dto.key_type,
                            account,
                        },
                    },
                });
            if (existingForAccount) {
                const suggestedAccount = suggestNextIntegrationAccount(
                    existingKeys,
                );
                throw new ConflictException(
                    `${KEY_TYPE_LABELS[dto.key_type]} already exists for account "${account}". Update the existing key or add a new account (for example "${suggestedAccount}").`,
                );
            }
        }

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

            await this.ensureDefaultAccountAfterKeyChange(
                integration.uuid,
                provider,
            );

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

    async createSmtpAccount(
        user_uuid: string,
        dto: CreateSmtpAccountDto,
    ): Promise<IntegrationResponse> {
        const provider = ExternalIntegrationProvider.SMTP;
        const account = dto.account.trim();
        const entries: Array<{ key_type: IntegrationKeyType; secret: string }> = [
            { key_type: IntegrationKeyType.HOST, secret: dto.host.trim() },
            { key_type: IntegrationKeyType.PORT, secret: String(dto.port) },
            { key_type: IntegrationKeyType.USERNAME, secret: dto.username.trim() },
            { key_type: IntegrationKeyType.PASSWORD, secret: dto.password },
            { key_type: IntegrationKeyType.FROM_EMAIL, secret: dto.from_email.trim() },
        ];

        const integration = await this.ensureIntegration(user_uuid, provider);
        const integrationWithKeys = await this.prisma.integration.findUnique({
            where: { uuid: integration.uuid },
            include: { keys: true },
        });
        const existingKeys = integrationWithKeys?.keys ?? [];
        const hasAccountKeys = existingKeys.some((key) => key.account === account);
        if (hasAccountKeys) {
            const suggestedAccount = suggestNextIntegrationAccount(existingKeys);
            throw new ConflictException(
                `SMTP account "${account}" already exists. Use a different account label (for example "${suggestedAccount}").`,
            );
        }

        const encryptionKey = this.encryptionKey();

        await this.prisma.$transaction(
            entries.map(({ key_type, secret }) =>
                this.prisma.integrationKey.create({
                    data: {
                        integration_uuid: integration.uuid,
                        key_type,
                        account,
                        secret: encryptIntegrationSecret(secret, encryptionKey),
                        last4: secretLast4(secret),
                    },
                }),
            ),
        );

        await this.ensureDefaultAccountAfterKeyChange(integration.uuid, provider);

        const refreshed = await this.prisma.integration.findUnique({
            where: { uuid: integration.uuid },
            include: {
                keys: {
                    orderBy: [{ account: 'asc' }, { key_type: 'asc' }],
                },
            },
        });

        return this.toIntegrationResponse(provider, refreshed ?? undefined);
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
        const owned = await this.requireOwnedKey(user_uuid, key_uuid);
        await this.prisma.integrationKey.delete({ where: { uuid: key_uuid } });

        await this.ensureDefaultAccountAfterKeyChange(
            owned.integration.uuid,
            owned.integration.provider,
        );

        return { uuid: key_uuid };
    }

    async setDefaultAccount(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
        dto: SetDefaultIntegrationAccountDto,
    ): Promise<IntegrationResponse> {
        if (!providerSupportsDefaultAccountSelection(provider)) {
            throw new BadRequestException(
                `${INTEGRATION_PROVIDER_LABELS[provider]} does not support default account selection`,
            );
        }

        const account = dto.account.trim();
        const integration = await this.prisma.integration.findUnique({
            where: { user_uuid_provider: { user_uuid, provider } },
            include: { keys: true },
        });
        if (!integration) {
            throw new NotFoundException(
                `${INTEGRATION_PROVIDER_LABELS[provider]} integration is not configured`,
            );
        }

        const accounts = listDistinctIntegrationAccounts(integration.keys);
        if (!accounts.includes(account)) {
            throw new BadRequestException(
                `Account "${account}" has no stored keys for ${INTEGRATION_PROVIDER_LABELS[provider]}`,
            );
        }

        const updated = await this.prisma.integration.update({
            where: { uuid: integration.uuid },
            data: { default_account: account },
            include: {
                keys: {
                    orderBy: [{ account: 'asc' }, { key_type: 'asc' }],
                },
            },
        });

        return this.toIntegrationResponse(provider, updated);
    }

    async getDefaultAccount(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
    ): Promise<string | null> {
        const integration = await this.prisma.integration.findUnique({
            where: { user_uuid_provider: { user_uuid, provider } },
            include: { keys: true },
        });
        if (!integration) {
            return null;
        }
        return resolveEffectiveDefaultAccount(
            integration.default_account,
            integration.keys,
        );
    }

    async getDecryptedSecret(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
        key_type: IntegrationKeyType,
        account?: string,
    ): Promise<string> {
        const integration = await this.prisma.integration.findUnique({
            where: { user_uuid_provider: { user_uuid, provider } },
            include: { keys: true },
        });
        if (!integration) {
            throw new NotFoundException(
                `Credential ${formatIntegrationKeyEnvName(provider, key_type, account ?? '1')} not found`,
            );
        }

        const resolvedAccount =
            account?.trim() ||
            resolveEffectiveDefaultAccount(
                integration.default_account,
                integration.keys,
            ) ||
            '1';

        const key = await this.prisma.integrationKey.findUnique({
            where: {
                integration_uuid_key_type_account: {
                    integration_uuid: integration.uuid,
                    key_type,
                    account: resolvedAccount,
                },
            },
        });
        if (!key) {
            this.logger.error(
                `Integration credential not found user=${user_uuid} env=${formatIntegrationKeyEnvName(provider, key_type, resolvedAccount)}`,
            );
            throw new NotFoundException(
                `Credential ${formatIntegrationKeyEnvName(provider, key_type, resolvedAccount)} not found`,
            );
        }
        this.logger.log(
            `Integration credential loaded user=${user_uuid} env=${formatIntegrationKeyEnvName(provider, key_type, resolvedAccount)} last4=${key.last4 ?? 'n/a'}`,
        );
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

    private async ensureDefaultAccountAfterKeyChange(
        integration_uuid: string,
        provider: ExternalIntegrationProvider,
    ): Promise<void> {
        if (!providerSupportsDefaultAccountSelection(provider)) {
            return;
        }

        const integration = await this.prisma.integration.findUnique({
            where: { uuid: integration_uuid },
            include: { keys: true },
        });
        if (!integration) {
            return;
        }

        const effective = resolveEffectiveDefaultAccount(
            integration.default_account,
            integration.keys,
        );

        if (effective === integration.default_account) {
            return;
        }

        await this.prisma.integration.update({
            where: { uuid: integration_uuid },
            data: { default_account: effective },
        });
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
        const keys = row?.keys ?? [];
        return {
            provider,
            uuid: row?.uuid ?? null,
            label: INTEGRATION_PROVIDER_LABELS[provider],
            description: INTEGRATION_PROVIDER_DESCRIPTIONS[provider],
            disabled: DISABLED_INTEGRATION_PROVIDERS.includes(provider),
            allows_multiple_accounts: providerAllowsMultipleAccounts(provider),
            supports_default_account_selection:
                providerSupportsDefaultAccountSelection(provider),
            default_account: resolveEffectiveDefaultAccount(
                row?.default_account,
                keys,
            ),
            keyTypes: this.keyTypeOptions(provider),
            keys: keys.map((key) => this.toKeyResponse(key, provider)),
        };
    }

    private toKeyResponse(
        key: IntegrationKey,
        provider: ExternalIntegrationProvider,
    ): IntegrationKeyResponse {
        const exposeDisplayValue = shouldExposeIntegrationKeyDisplayValue(
            provider,
            key.key_type,
        );

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
            last4: exposeDisplayValue ? null : key.last4,
            display_value: exposeDisplayValue
                ? decryptIntegrationSecret(key.secret, this.encryptionKey())
                : null,
            created_at: key.created_at,
            updated_at: key.updated_at,
        };
    }
}

