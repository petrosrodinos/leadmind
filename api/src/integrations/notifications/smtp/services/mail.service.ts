import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmail } from '../../sendgrid/interfaces/mail.interfaces';
import { SmtpConfig } from '@/modules/integrations/interfaces/email-credentials.interface';
import { SmtpAdapter } from '../smtp.adapter';

@Injectable()
export class SmtpMailService {
    constructor(private readonly smtpAdapter: SmtpAdapter) {}

    async sendEmail(createEmail: CreateEmail, smtpConfig: SmtpConfig) {
        try {
            return await this.smtpAdapter.sendEmail(createEmail, smtpConfig);
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to send email with SMTP: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}
