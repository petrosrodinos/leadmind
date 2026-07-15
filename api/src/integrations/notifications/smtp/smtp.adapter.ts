import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as dns from 'node:dns';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CreateEmail } from '../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';

@Injectable()
export class SmtpAdapter {
    private readonly logger = new Logger(SmtpAdapter.name);

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        const from = createEmail.from || smtpConfig.fromEmail;
        this.logger.log(
            `Sending SMTP email to=${createEmail.to} subject="${createEmail.subject}" from=${from} host=${smtpConfig.host}:${smtpConfig.port} user=${smtpConfig.username}`,
        );

        const transporter = nodemailer.createTransport(
            this.buildTransportOptions(smtpConfig),
        );

        try {
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

            this.logger.log(
                `SMTP email sent to=${createEmail.to} messageId=${info.messageId} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} response="${info.response}"`,
            );

            if (info.rejected?.length) {
                this.logger.warn(
                    `SMTP rejected recipients for to=${createEmail.to}: ${JSON.stringify(info.rejected)}`,
                );
            }

            return { id: info.messageId, data: { id: info.messageId } };
        } catch (error) {
            this.logger.error(
                `SMTP send failed to=${createEmail.to} subject="${createEmail.subject}" host=${smtpConfig.host}:${smtpConfig.port}: ${this.errMsg(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw new InternalServerErrorException(
                `Failed to send email with SMTP: ${this.errMsg(error)}`,
            );
        } finally {
            transporter.close();
        }
    }

    private buildTransportOptions(smtpConfig: SmtpConfig): SMTPTransport.Options {
        const secure = smtpConfig.port === 465;

        return {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure,
            requireTLS: !secure && smtpConfig.port !== 25,
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password,
            },
            connectionTimeout: 30_000,
            greetingTimeout: 30_000,
            socketTimeout: 60_000,
            tls: {
                minVersion: 'TLSv1.2',
            },
            lookup: (hostname, _options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            },
        } as SMTPTransport.Options;
    }

    private errMsg(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
