import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ExternalIntegrationProvider,
    IntegrationCredential,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    decryptIntegrationSecret,
    encryptIntegrationSecret,
    secretLast4,
} from '@/shared/utils/integration-secret.util';
import {
    formatCredentialEnvName,
    formatCredentialLabel,
    getIntegrationProviderDefinition,
    INTEGRATION_PROVIDER_DEFINITIONS,
    isCredentialKindAllowed,
} from './integrations.catalog';
import { CreateIntegrationCredentialDto } from './dto/create-integration-credential.dto';
import { UpdateIntegrationCredentialDto } from './dto/update-integration-credential.dto';
import {
    IntegrationCredentialResponse,
    IntegrationProviderResponse,
} from './interfaces/integration.interface';

@Injectable()
export class IntegrationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {}

    async findAll(user_uuid: string): Promise<IntegrationProviderResponse[]> {
        const credentials = await this.prisma.integrationCredential.findMany({
            where: { user_uuid },
            orderBy: [
                { provider: 'asc' },
                { account: 'asc' },
                { kind: 'asc' },
            ],
        });

        const credentialsByProvider = new Map<
            ExternalIntegrationProvider,
            IntegrationCredential[]
        >();
        for (const row of credentials) {
            const list = credentialsByProvider.get(row.provider) ?? [];
            list.push(row);
            credentialsByProvider.set(row.provider, list);
        }

        return INTEGRATION_PROVIDER_DEFINITIONS.map((definition) => ({
            provider: definition.provider,
            label: definition.label,
            description: definition.description,
            credentialKinds: definition.credentialKinds,
            credentials: (credentialsByProvider.get(definition.provider) ?? []).map(
                (row) => this.toCredentialResponse(row),
            ),
        }));
    }

    async createCredential(
        user_uuid: string,
        dto: CreateIntegrationCredentialDto,
    ): Promise<IntegrationCredentialResponse> {
        if (!isCredentialKindAllowed(dto.provider, dto.kind)) {
            throw new BadRequestException(
                `Credential kind "${dto.kind}" is not supported for ${dto.provider}`,
            );
        }

        const account = dto.account.trim();
        const kind = dto.kind.trim();

        try {
            const row = await this.prisma.integrationCredential.create({
                data: {
                    user_uuid,
                    provider: dto.provider,
                    account,
                    kind,
                    secret: encryptIntegrationSecret(
                        dto.secret.trim(),
                        this.encryptionKey(),
                    ),
                    last4: secretLast4(dto.secret),
                },
            });
            return this.toCredentialResponse(row);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(
                    `${formatCredentialLabel(dto.provider, kind, account)} already exists`,
                );
            }
            throw error;
        }
    }

    async updateCredential(
        user_uuid: string,
        uuid: string,
        dto: UpdateIntegrationCredentialDto,
    ): Promise<IntegrationCredentialResponse> {
        await this.requireOwnedCredential(user_uuid, uuid);

        const row = await this.prisma.integrationCredential.update({
            where: { uuid },
            data: {
                secret: encryptIntegrationSecret(
                    dto.secret.trim(),
                    this.encryptionKey(),
                ),
                last4: secretLast4(dto.secret),
            },
        });
        return this.toCredentialResponse(row);
    }

    async removeCredential(
        user_uuid: string,
        uuid: string,
    ): Promise<{ uuid: string }> {
        await this.requireOwnedCredential(user_uuid, uuid);
        await this.prisma.integrationCredential.delete({ where: { uuid } });
        return { uuid };
    }

    async getDecryptedCredential(
        user_uuid: string,
        provider: ExternalIntegrationProvider,
        kind: string,
        account = 'default',
    ): Promise<string> {
        getIntegrationProviderDefinition(provider);

        const row = await this.prisma.integrationCredential.findUnique({
            where: {
                user_uuid_provider_account_kind: {
                    user_uuid,
                    provider,
                    account,
                    kind,
                },
            },
        });
        if (!row) {
            throw new NotFoundException(
                `Credential ${formatCredentialEnvName(provider, kind, account)} not found`,
            );
        }
        return decryptIntegrationSecret(row.secret, this.encryptionKey());
    }

    private async requireOwnedCredential(
        user_uuid: string,
        uuid: string,
    ): Promise<IntegrationCredential> {
        const row = await this.prisma.integrationCredential.findFirst({
            where: { uuid, user_uuid },
        });
        if (!row) {
            throw new NotFoundException(`Credential ${uuid} not found`);
        }
        return row;
    }

    private encryptionKey(): string {
        return (
            this.config.get<string>('INTEGRATIONS_ENCRYPTION_KEY') ??
            this.config.get<string>('JWT_SECRET') ??
            ''
        );
    }

    private toCredentialResponse(
        row: IntegrationCredential,
    ): IntegrationCredentialResponse {
        return {
            uuid: row.uuid,
            provider: row.provider,
            account: row.account,
            kind: row.kind,
            label: formatCredentialLabel(row.provider, row.kind, row.account),
            env_name: formatCredentialEnvName(
                row.provider,
                row.kind,
                row.account,
            ),
            last4: row.last4,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
}
