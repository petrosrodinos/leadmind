import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResendConfig } from './resend/resend.config';
import { ResendAdapter } from './resend/resend.adapter';
import { ResendMailService } from './services/mail.service';

@Module({
  imports: [ConfigModule],
  providers: [ResendMailService, ResendConfig, ResendAdapter, Logger],
  exports: [ResendMailService],
})
export class ResendModule {}
