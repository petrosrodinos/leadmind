import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { EmailConfig } from '@/shared/config/email';
import { CreateEmail, EmailFromAddress } from '../../sendgrid/interfaces/mail.interfaces';
import { ResendConfig } from './resend.config';

@Injectable()
export class ResendAdapter {
  private readonly logger = new Logger(ResendAdapter.name);
  private readonly emailFromAddresses: EmailFromAddress;

  constructor(private readonly resendConfig: ResendConfig) {
    this.emailFromAddresses = EmailConfig.email_addresses;
  }

  public async sendEmail(createEmail: CreateEmail) {
    try {
      const resendClient = this.resendConfig.getResendClient();
      return await resendClient.emails.send({
        from: createEmail.from || this.emailFromAddresses.confirmation,
        to: createEmail.to,
        subject: createEmail.subject,
        text: createEmail.text,
        html: createEmail.html,
        cc: createEmail.cc,
        bcc: createEmail.bcc,
        replyTo: createEmail.replyTo,
        headers: createEmail.headers,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to send email with Resend');
    }
  }
}
