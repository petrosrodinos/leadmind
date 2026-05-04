import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendGridAdapter } from './sendgrid/sendgrid.adapter';
import { SendgridMailService } from './services/mail.service';
import { SendgridConfig } from './sendgrid/sendgrid.config';
import { TemplateService } from './utils/templates.utils';
import { SendGridListService } from './services/list.service';

@Module({
    imports: [ConfigModule],
    providers: [
        SendgridMailService,
        SendGridAdapter,
        SendgridConfig,
        TemplateService,
        Logger,
        SendGridListService
    ],
    exports: [SendgridMailService, SendGridListService],
})
export class SendgridModule { }
