import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEmail } from '../../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';
import { SmtpAdapter } from '../smtp.adapter';

@Injectable()
export class SmtpMailService {
    private readonly logger = new Logger(SmtpMailService.name);

    constructor(private readonly smtpAdapter: SmtpAdapter) {}

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        this.logger.log(
            `SMTP send requested to=${createEmail.to} subject="${createEmail.subject}" from=${createEmail.from ?? smtpConfig.fromEmail}`,
        );

        try {
            const result = await this.smtpAdapter.sendEmail(createEmail, smtpConfig);
            this.logger.log(`SMTP send completed to=${createEmail.to} id=${result?.id ?? 'unknown'}`);
            return result;
        } catch (error) {
            this.logger.error(
                `SMTP send service failed to=${createEmail.to}: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
            );
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to send email with SMTP: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}
