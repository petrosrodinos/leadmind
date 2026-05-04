import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwillioConfig } from './config/twilio.config';
import { TwillioSmsService } from './services/sms.service';
import { CallsService } from './services/calls.service';

@Module({
    imports: [ConfigModule],
    providers: [
        TwillioSmsService,
        TwillioConfig,
        Logger,
        CallsService
    ],
    exports: [TwillioSmsService, CallsService],
})
export class TwillioModule { }
