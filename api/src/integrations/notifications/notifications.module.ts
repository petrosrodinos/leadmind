import { Module } from '@nestjs/common';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { TwillioModule } from './twillio/twillio.module';

@Module({
    imports: [SendgridModule, TwillioModule],
    providers: [],
    exports: [],
})
export class NotificationsIntegrationModule { }