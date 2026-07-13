import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export function createResendClient(apiKey: string): Resend {
  return new Resend(apiKey);
}

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
      this.logger.warn('RESEND_API_KEY is not configured in environment');
      return;
    }

    this.resendClient = new Resend(apiKey);
    this.logger.log(`Resend env client initialized last4=${apiKey.slice(-4)}`);
  }

  getResendClient(): Resend {
    if (!this.resendClient) {
      throw new Error('Resend client is not initialized');
    }

    return this.resendClient;
  }

  createClient(apiKey: string): Resend {
    this.logger.log(
      `Creating Resend client keySource=integration last4=${apiKey.slice(-4)}`,
    );
    return createResendClient(apiKey);
  }
}
