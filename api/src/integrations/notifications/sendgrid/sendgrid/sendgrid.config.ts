import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');

@Injectable()
export class SendgridConfig {
    private sendgridMailClient: any;
    private sendgridClient: any;
    private readonly logger = new Logger(SendgridConfig.name);

    constructor(private readonly configService: ConfigService) {
        this.initSendgrid();
    }

    private initSendgrid() {
        const apiKey = this.configService.get('SENDGRID_API_KEY');
        if (!apiKey) {
            this.logger.error('SENDGRID_API_KEY is not configured');
            return;
        }

        sgMail.setApiKey(apiKey);
        sgClient.setApiKey(apiKey);

        this.sendgridMailClient = sgMail;
        this.sendgridClient = sgClient;

        this.logger.debug('SendGrid initialized');
    }

    getSendgridClient(): any {
        return this.sendgridMailClient;
    }

    getSendgridMarketingClient(): any {
        return this.sendgridClient;
    }
}