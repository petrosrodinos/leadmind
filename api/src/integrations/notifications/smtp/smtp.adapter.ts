import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateEmail } from '../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';

@Injectable()
export class SmtpAdapter {
    private readonly logger = new Logger(SmtpAdapter.name);

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpConfig.host,
                port: smtpConfig.port,
                secure: smtpConfig.port === 465,
                auth: {
                    user: smtpConfig.username,
                    pass: smtpConfig.password,
                },
            });

            const info = await transporter.sendMail({
                from: createEmail.from || smtpConfig.fromEmail,
                to: createEmail.to,
                subject: createEmail.subject,
                text: createEmail.text,
                html: createEmail.html,
                cc: createEmail.cc,
                bcc: createEmail.bcc,
                replyTo: createEmail.replyTo,
                headers: createEmail.headers,
            });

            return { id: info.messageId, data: { id: info.messageId } };
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException('Failed to send email with SMTP');
        }
    }
}
