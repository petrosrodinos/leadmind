import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as dns from 'node:dns';
import * as net from 'node:net';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CreateEmail } from '../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';
import {
    createNodemailerLogger,
    logSmtp,
    SmtpFlowTimer,
} from './smtp-flow-log.util';

@Injectable()
export class SmtpAdapter {
    private readonly logger = new Logger(SmtpAdapter.name);

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        const timer = new SmtpFlowTimer();
        const from = createEmail.from || smtpConfig.fromEmail;
        const connectHost = await this.resolveIpv4Host(smtpConfig.host);

        logSmtp(this.logger, 'log', {
            step: 'adapter-start',
            to: createEmail.to,
            subject: createEmail.subject,
            from,
            host: smtpConfig.host,
            connectHost,
            port: smtpConfig.port,
            username: smtpConfig.username,
            secure: smtpConfig.port === 465,
            requireTls: smtpConfig.port !== 465 && smtpConfig.port !== 25,
        });

        timer.mark('transport-create');
        const transporter = nodemailer.createTransport(
            this.buildTransportOptions(smtpConfig, connectHost),
        );
        logSmtp(this.logger, 'log', {
            step: 'transport-created',
            durationMs: timer.sinceMark('transport-create'),
        });

        try {
            timer.mark('send-mail');
            logSmtp(this.logger, 'log', {
                step: 'send-mail-start',
                to: createEmail.to,
                host: smtpConfig.host,
                port: smtpConfig.port,
            });

            const info = await transporter.sendMail({
                from,
                to: createEmail.to,
                subject: createEmail.subject,
                text: createEmail.text,
                html: createEmail.html,
                cc: createEmail.cc,
                bcc: createEmail.bcc,
                replyTo: createEmail.replyTo,
                headers: createEmail.headers,
            });

            logSmtp(this.logger, 'log', {
                step: 'send-mail-done',
                to: createEmail.to,
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
                sendDurationMs: timer.sinceMark('send-mail'),
                totalDurationMs: timer.sinceStart(),
            });

            if (info.rejected?.length) {
                logSmtp(this.logger, 'warn', {
                    step: 'recipients-rejected',
                    to: createEmail.to,
                    rejected: info.rejected,
                });
            }

            return { id: info.messageId, data: { id: info.messageId } };
        } catch (error) {
            logSmtp(this.logger, 'error', {
                step: 'send-mail-failed',
                to: createEmail.to,
                subject: createEmail.subject,
                host: smtpConfig.host,
                port: smtpConfig.port,
                error: this.errMsg(error),
                sendDurationMs: timer.sinceMark('send-mail'),
                totalDurationMs: timer.sinceStart(),
            });
            this.logger.error(
                error instanceof Error ? error.stack : undefined,
            );
            throw new InternalServerErrorException(
                this.formatSendFailure(error, smtpConfig),
            );
        } finally {
            timer.mark('transport-close');
            transporter.close();
            logSmtp(this.logger, 'log', {
                step: 'transport-closed',
                closeDurationMs: timer.sinceMark('transport-close'),
                totalDurationMs: timer.sinceStart(),
            });
        }
    }

    private async resolveIpv4Host(hostname: string): Promise<string> {
        if (net.isIP(hostname)) {
            return hostname;
        }

        try {
            const addresses = await dns.promises.resolve4(hostname);
            const address = addresses[0];
            logSmtp(this.logger, 'debug', {
                step: 'dns-resolve4',
                hostname,
                address,
                candidates: addresses.length,
            });
            return address;
        } catch (error) {
            logSmtp(this.logger, 'warn', {
                step: 'dns-resolve4-fallback',
                hostname,
                error: this.errMsg(error),
            });
            return hostname;
        }
    }

    private buildTransportOptions(
        smtpConfig: SmtpConfig,
        connectHost: string,
    ): SMTPTransport.Options {
        const secure = smtpConfig.port === 465;

        return {
            host: connectHost,
            port: smtpConfig.port,
            secure,
            requireTLS: !secure && smtpConfig.port !== 25,
            family: 4,
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password,
            },
            connectionTimeout: 30_000,
            greetingTimeout: 30_000,
            socketTimeout: 60_000,
            tls: {
                minVersion: 'TLSv1.2',
                servername: smtpConfig.host,
            },
            lookup: (hostname, _options, callback) => {
                if (net.isIP(hostname)) {
                    callback(null, hostname, net.isIPv6(hostname) ? 6 : 4);
                    return;
                }

                dns.lookup(hostname, { family: 4, verbatim: true }, (error, address, family) => {
                    if (error) {
                        logSmtp(this.logger, 'error', {
                            step: 'dns-lookup-failed',
                            hostname,
                            error: error.message,
                        });
                    } else {
                        logSmtp(this.logger, 'debug', {
                            step: 'dns-lookup-done',
                            hostname,
                            address,
                            family,
                        });
                    }
                    callback(error, address, family);
                });
            },
            logger: createNodemailerLogger(this.logger) as SMTPTransport.Options['logger'],
            debug: true,
        } as SMTPTransport.Options;
    }

    private errMsg(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    private formatSendFailure(error: unknown, smtpConfig: SmtpConfig): string {
        const message = this.errMsg(error);
        const code =
            error && typeof error === 'object' && 'code' in error
                ? String((error as { code?: unknown }).code ?? '')
                : '';
        const isNetworkBlocked =
            code === 'ETIMEDOUT' ||
            code === 'ESOCKET' ||
            code === 'ENETUNREACH' ||
            /connection timeout/i.test(message);

        if (isNetworkBlocked) {
            return `Failed to send email with SMTP: cannot reach ${smtpConfig.host}:${smtpConfig.port} (${message}). Cloud hosts often block outbound SMTP; use Resend or another HTTP email provider for production.`;
        }

        return `Failed to send email with SMTP: ${message}`;
    }
}
