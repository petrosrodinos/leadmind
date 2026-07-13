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

  public async getReceivedEmail(emailId: string) {
    try {
      const resendClient = this.resendConfig.getResendClient();
      return await resendClient.emails.receiving.get(emailId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to retrieve received email from Resend');
    }
  }

  public async sendEmail(createEmail: CreateEmail, apiKey?: string) {
    const from = createEmail.from || this.emailFromAddresses.confirmation;
    const keySource = apiKey ? 'integration' : 'default';

    this.logger.log(
      `Sending Resend email to=${createEmail.to} subject="${createEmail.subject}" from=${from} keySource=${keySource}`,
    );

    try {
      const resendClient = apiKey
        ? this.resendConfig.createClient(apiKey)
        : this.resendConfig.getResendClient();
      const response = await resendClient.emails.send({
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

      if (response.error) {
        this.logger.error(
          `Resend API error to=${createEmail.to} subject="${createEmail.subject}": ${response.error.name} - ${response.error.message}`,
        );
        throw new InternalServerErrorException(
          `Failed to send email with Resend: ${response.error.message}`,
        );
      }

      if (!response.data?.id) {
        this.logger.error(
          `Resend API returned no id to=${createEmail.to} subject="${createEmail.subject}" response=${JSON.stringify(response)}`,
        );
      }

      this.logger.log(
        `Resend email sent to=${createEmail.to} id=${response.data?.id ?? 'unknown'}`,
      );

      return response;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error(
        `Resend send failed to=${createEmail.to} subject="${createEmail.subject}": ${this.errMsg(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to send email with Resend');
    }
  }

  private errMsg(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
