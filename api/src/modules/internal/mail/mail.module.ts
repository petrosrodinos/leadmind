import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { SendgridModule } from '@/integrations/notifications/sendgrid/sendgrid.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';

@Module({
  imports: [SendgridModule, ResendModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule { }
