import { Module } from '@nestjs/common';
import { SmtpAdapter } from './smtp.adapter';
import { SmtpMailService } from './services/mail.service';

@Module({
    providers: [SmtpAdapter, SmtpMailService],
    exports: [SmtpMailService],
})
export class SmtpModule {}
