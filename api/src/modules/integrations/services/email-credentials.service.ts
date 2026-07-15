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
import { logSmtp, SmtpFlowTimer } from '@/integrations/notifications/smtp/smtp-flow-log.util';

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
        const timer = new SmtpFlowTimer();
        logSmtp(this.logger, 'log', {
            step: 'load-config-start',
            user: user_uuid,
            account,
        });
        await this.assertSendableAccount(user_uuid, ExternalIntegrationProvider.SMTP, account);
        timer.mark('secrets');
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
        logSmtp(this.logger, 'log', {
            step: 'load-config-secrets',
            user: user_uuid,
            account,
            secretsDurationMs: timer.sinceMark('secrets'),
        });

        const parsedPort = parseInt(port, 10);
        if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
            logSmtp(this.logger, 'error', {
                step: 'load-config-invalid-port',
                user: user_uuid,
                account,
                port,
            });
            throw new BadRequestException(`Invalid SMTP port for account ${account}`);
        }

        const config = {
            host: host.trim(),
            port: parsedPort,
            username: username.trim(),
            password,
            fromEmail: fromEmail.trim(),
        };
        logSmtp(this.logger, 'log', {
            step: 'load-config-done',
            user: user_uuid,
            account,
            host: config.host,
            port: config.port,
            from: config.fromEmail,
            username: config.username,
            passwordLast4: config.password.slice(-4),
            totalDurationMs: timer.sinceStart(),
        });
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
            logSmtp(this.logger, 'warn', {
                step: 'assert-sendable-failed',
                user: user_uuid,
                provider,
                account,
                available: sendable.map((row) => `${row.provider}:${row.account}`),
            });
            throw new BadRequestException(
                `${provider} account "${account}" is not configured or incomplete`,
            );
        }
        if (provider === ExternalIntegrationProvider.SMTP) {
            logSmtp(this.logger, 'log', {
                step: 'assert-sendable-ok',
                user: user_uuid,
                account,
            });
        } else {
            this.logger.log(
                `Sendable account verified user=${user_uuid} provider=${provider} account=${account}`,
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
                if (integration.provider === ExternalIntegrationProvider.SMTP) {
                    this.logSmtpAccountState(integration.keys, account);
                }
                if (this.isAccountComplete(integration.provider, integration.keys, account)) {
                    accounts.push({
                        provider: integration.provider as EmailProviderTarget['provider'],
                        account,
                        label: `${integration.provider} · ${account}`,
                    });
                }
            }
        }

        logSmtp(this.logger, 'debug', {
            step: 'list-sendable-accounts',
            user: user_uuid,
            accounts: accounts.map((row) => `${row.provider}:${row.account}`),
        });

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
                if (provider === ExternalIntegrationProvider.SMTP) {
                    this.logSmtpAccountState(integration.keys, account);
                }
                continue;
            }
            logSmtp(this.logger, 'log', {
                step: 'resolve-default-target',
                user: user_uuid,
                account,
            });
            return { provider, account };
        }

        logSmtp(this.logger, 'warn', {
            step: 'resolve-default-target-missing',
            user: user_uuid,
        });
        return null;
    }

    private logSmtpAccountState(
        keys: { key_type: IntegrationKeyType; account: string }[],
        account: string,
    ): void {
        const required = PROVIDER_KEY_TYPES[ExternalIntegrationProvider.SMTP];
        const accountKeys = keys.filter((key) => key.account.trim() === account.trim());
        const present = required.filter((key_type) =>
            accountKeys.some((key) => key.key_type === key_type),
        );
        const missing = required.filter(
            (key_type) => !accountKeys.some((key) => key.key_type === key_type),
        );
        logSmtp(this.logger, missing.length > 0 ? 'warn' : 'debug', {
            step: missing.length > 0 ? 'account-incomplete' : 'account-complete',
            account,
            present,
            missing,
        });
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
