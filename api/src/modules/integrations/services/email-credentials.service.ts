import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    ExternalIntegrationProvider,
    IntegrationKeyType,
} from '@/generated/prisma';
import { IntegrationsService } from '../integrations.service';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    listDistinctIntegrationAccounts,
    PROVIDER_KEY_TYPES,
    resolveEffectiveDefaultAccount,
} from '../constants/integration-key-types.constants';
import {
    EmailProviderTarget,
    SendableEmailAccount,
    SmtpConfig,
} from '../interfaces/email-credentials.interface';

const EMAIL_PROVIDERS = [
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.SMTP,
] as const;

@Injectable()
export class EmailCredentialsService {
    private readonly logger = new Logger(EmailCredentialsService.name);

    constructor(
        private readonly integrationsService: IntegrationsService,
        private readonly prisma: PrismaService,
    ) {}

    async getResendFromEmail(user_uuid: string, account: string): Promise<string> {
        await this.assertSendableAccount(user_uuid, ExternalIntegrationProvider.RESEND, account);
        const fromEmail = await this.integrationsService.getDecryptedSecret(
            user_uuid,
            ExternalIntegrationProvider.RESEND,
            IntegrationKeyType.FROM_EMAIL,
            account,
        );
        return fromEmail.trim();
    }

    async getResendApiKey(user_uuid: string, account: string): Promise<string> {
        this.logger.log(`Loading Resend API key user=${user_uuid} account=${account}`);
        await this.assertSendableAccount(user_uuid, ExternalIntegrationProvider.RESEND, account);
        const secret = await this.integrationsService.getDecryptedSecret(
            user_uuid,
            ExternalIntegrationProvider.RESEND,
            IntegrationKeyType.API_KEY,
            account,
        );
        this.logger.log(
            `Resend API key loaded user=${user_uuid} account=${account} last4=${secret.slice(-4)}`,
        );
        return secret;
    }

    async getResendWebhookSecret(user_uuid: string, account: string): Promise<string> {
        return this.integrationsService.getDecryptedSecret(
            user_uuid,
            ExternalIntegrationProvider.RESEND,
            IntegrationKeyType.WEBHOOK_SECRET,
            account,
        );
    }

    async tryGetResendWebhookSecret(
        user_uuid: string,
        account: string,
    ): Promise<string | null> {
        try {
            return await this.getResendWebhookSecret(user_uuid, account);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return null;
            }
            throw error;
        }
    }

    async listResendWebhookSecrets(user_uuid: string): Promise<string[]> {
        const integration = await this.prisma.integration.findUnique({
            where: {
                user_uuid_provider: {
                    user_uuid,
                    provider: ExternalIntegrationProvider.RESEND,
                },
            },
            include: {
                keys: {
                    where: { key_type: IntegrationKeyType.WEBHOOK_SECRET },
                },
            },
        });
        if (!integration?.keys.length) {
            return [];
        }

        const secrets = await Promise.all(
            integration.keys.map((key) =>
                this.tryGetResendWebhookSecret(user_uuid, key.account),
            ),
        );
        return secrets.filter((secret): secret is string => Boolean(secret));
    }

    async getSmtpConfig(user_uuid: string, account: string): Promise<SmtpConfig> {
        await this.assertSendableAccount(user_uuid, ExternalIntegrationProvider.SMTP, account);
        const [host, port, username, password, fromEmail] = await Promise.all([
            this.integrationsService.getDecryptedSecret(
                user_uuid,
                ExternalIntegrationProvider.SMTP,
                IntegrationKeyType.HOST,
                account,
            ),
            this.integrationsService.getDecryptedSecret(
                user_uuid,
                ExternalIntegrationProvider.SMTP,
                IntegrationKeyType.PORT,
                account,
            ),
            this.integrationsService.getDecryptedSecret(
                user_uuid,
                ExternalIntegrationProvider.SMTP,
                IntegrationKeyType.USERNAME,
                account,
            ),
            this.integrationsService.getDecryptedSecret(
                user_uuid,
                ExternalIntegrationProvider.SMTP,
                IntegrationKeyType.PASSWORD,
                account,
            ),
            this.integrationsService.getDecryptedSecret(
                user_uuid,
                ExternalIntegrationProvider.SMTP,
                IntegrationKeyType.FROM_EMAIL,
                account,
            ),
        ]);

        const parsedPort = parseInt(port, 10);
        if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
            throw new BadRequestException(`Invalid SMTP port for account ${account}`);
        }

        return {
            host: host.trim(),
            port: parsedPort,
            username: username.trim(),
            password,
            fromEmail: fromEmail.trim(),
        };
    }

    async assertSendableAccount(
        user_uuid: string,
        provider: EmailProviderTarget['provider'],
        account: string,
    ): Promise<void> {
        const sendable = await this.resolveSendableAccounts(user_uuid);
        const match = sendable.find(
            (row) => row.provider === provider && row.account === account.trim(),
        );
        if (!match) {
            throw new BadRequestException(
                `${provider} account "${account}" is not configured or incomplete`,
            );
        }
    }

    async resolveSendableAccounts(user_uuid: string): Promise<SendableEmailAccount[]> {
        const integrations = await this.prisma.integration.findMany({
            where: {
                user_uuid,
                provider: { in: [...EMAIL_PROVIDERS] },
            },
            include: { keys: true },
        });

        const accounts: SendableEmailAccount[] = [];

        for (const integration of integrations) {
            const distinctAccounts = listDistinctIntegrationAccounts(integration.keys);
            for (const account of distinctAccounts) {
                if (this.isAccountComplete(integration.provider, integration.keys, account)) {
                    accounts.push({
                        provider: integration.provider as EmailProviderTarget['provider'],
                        account,
                        label: `${integration.provider} · ${account}`,
                    });
                }
            }
        }

        return accounts.sort((left, right) =>
            `${left.provider}:${left.account}`.localeCompare(
                `${right.provider}:${right.account}`,
                undefined,
                { numeric: true },
            ),
        );
    }

    async resolveDefaultTarget(user_uuid: string): Promise<EmailProviderTarget | null> {
        this.logger.log(`Resolving default email target user=${user_uuid}`);
        const integrations = await this.prisma.integration.findMany({
            where: {
                user_uuid,
                provider: { in: [...EMAIL_PROVIDERS] },
            },
            include: { keys: true },
        });

        for (const provider of EMAIL_PROVIDERS) {
            const integration = integrations.find((row) => row.provider === provider);
            if (!integration) continue;
            const account = resolveEffectiveDefaultAccount(
                integration.default_account,
                integration.keys,
            );
            if (!account) continue;
            if (!this.isAccountComplete(provider, integration.keys, account)) {
                continue;
            }
            return { provider, account };
        }

        return null;
    }

    private isAccountComplete(
        provider: ExternalIntegrationProvider,
        keys: { key_type: IntegrationKeyType; account: string }[],
        account: string,
    ): boolean {
        const accountKeys = keys.filter((key) => key.account.trim() === account.trim());
        if (provider === ExternalIntegrationProvider.RESEND) {
            const required = [
                IntegrationKeyType.API_KEY,
                IntegrationKeyType.FROM_EMAIL,
            ];
            return required.every((key_type) =>
                accountKeys.some((key) => key.key_type === key_type),
            );
        }
        if (provider === ExternalIntegrationProvider.SMTP) {
            const required = PROVIDER_KEY_TYPES[ExternalIntegrationProvider.SMTP];
            return required.every((key_type) =>
                accountKeys.some((key) => key.key_type === key_type),
            );
        }
        return false;
    }
}
