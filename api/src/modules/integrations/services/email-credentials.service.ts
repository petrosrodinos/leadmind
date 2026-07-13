import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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

    async getSmtpConfig(user_uuid: string, account: string): Promise<SmtpConfig> {
        this.logger.log(`Loading SMTP config user=${user_uuid} account=${account}`);
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

        const config = {
            host: host.trim(),
            port: parsedPort,
            username: username.trim(),
            password,
            fromEmail: fromEmail.trim(),
        };
        this.logger.log(
            `SMTP config loaded user=${user_uuid} account=${account} host=${config.host}:${config.port} from=${config.fromEmail} smtpUser=${config.username}`,
        );
        return config;
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
            this.logger.warn(
                `Sendable account check failed user=${user_uuid} provider=${provider} account=${account} available=${sendable.map((row) => `${row.provider}:${row.account}`).join(',') || 'none'}`,
            );
            throw new BadRequestException(
                `${provider} account "${account}" is not configured or incomplete`,
            );
        }
        this.logger.log(
            `Sendable account verified user=${user_uuid} provider=${provider} account=${account}`,
        );
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
            if (!this.isAccountComplete(provider, integration.keys, account)) continue;
            this.logger.log(
                `Default email target user=${user_uuid} provider=${provider} account=${account}`,
            );
            return { provider, account };
        }

        this.logger.warn(`No default email target user=${user_uuid}`);
        return null;
    }

    private isAccountComplete(
        provider: ExternalIntegrationProvider,
        keys: { key_type: IntegrationKeyType; account: string }[],
        account: string,
    ): boolean {
        const accountKeys = keys.filter((key) => key.account.trim() === account.trim());
        if (provider === ExternalIntegrationProvider.RESEND) {
            return accountKeys.some((key) => key.key_type === IntegrationKeyType.API_KEY);
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
