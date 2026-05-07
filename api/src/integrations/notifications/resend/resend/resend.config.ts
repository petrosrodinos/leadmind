import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendConfig {
  private resendClient: Resend | null = null;
  private readonly logger = new Logger(ResendConfig.name);

  constructor(private readonly configService: ConfigService) {
    this.initResend();
  }

  private initResend() {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not configured');
      return;
    }

    this.resendClient = new Resend(apiKey);
    this.logger.debug('Resend initialized');
  }

  getResendClient(): Resend {
    if (!this.resendClient) {
      throw new Error('Resend client is not initialized');
    }

    return this.resendClient;
  }
}
