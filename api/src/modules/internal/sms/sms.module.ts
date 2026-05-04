import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { TwillioModule } from 'src/integrations/notifications/twillio/twillio.module';

@Module({
  imports: [TwillioModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule { }
