import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEmail } from '../../sendgrid/interfaces/mail.interfaces';
import { ResendAdapter } from '../resend/resend.adapter';

@Injectable()
export class ResendMailService {
  private readonly logger = new Logger(ResendMailService.name);

  constructor(private readonly resendAdapter: ResendAdapter) {}

  public async sendEmail(createEmail: CreateEmail, apiKey?: string) {
    this.logger.log(
      `Resend send requested to=${createEmail.to} subject="${createEmail.subject}" keySource=${apiKey ? 'integration' : 'default'}`,
    );

    try {
      const result = await this.resendAdapter.sendEmail(createEmail, apiKey);
      this.logger.log(
        `Resend send completed to=${createEmail.to} id=${result?.data?.id ?? 'unknown'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Resend send service failed to=${createEmail.to}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send email with Resend');
    }
  }

  public async sendBulkEmails(createEmails: CreateEmail[]) {
    this.logger.log(`Resend bulk send requested count=${createEmails.length}`);

    try {
      const promises = createEmails.map(async (createEmail) => this.sendEmail(createEmail));
      const results = await Promise.all(promises);
      this.logger.log(`Resend bulk send completed count=${results.length}`);
      return results;
    } catch (error) {
      this.logger.error(
        `Resend bulk send failed count=${createEmails.length}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send bulk emails with Resend');
    }
  }
}
