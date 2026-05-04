import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { SendgridModule } from '@/integrations/notifications/sendgrid/sendgrid.module';

@Module({
  imports: [SendgridModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule { }
