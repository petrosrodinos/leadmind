import { Module } from '@nestjs/common';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TwillioModule } from './twillio/twillio.module';
import { ResendModule } from './resend/resend.module';

@Module({
    imports: [SendgridModule, TwillioModule, ResendModule],
    providers: [],
    exports: [],
})
export class NotificationsIntegrationModule { }