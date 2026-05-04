import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShortCode, ShortCodeTypes } from '../interfaces/sms.interfaces';


@Injectable()
export class TwillioConfig {
    private twillioClient: any;
    private readonly logger = new Logger(TwillioConfig.name);

    constructor(private readonly configService: ConfigService) {
        this.initTwilio();
    }

    private initTwilio() {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
            this.logger.error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not configured');
            return;
        }

        this.twillioClient = require('twilio')(accountSid, authToken);

        this.logger.debug('Twillio initialized');

    }

    getTwillioClient(): any {
        return this.twillioClient;
    }

    getTwilioNumbers(): { [key: string]: string } {
        return {
            'US': '+17089059169',
        };
    }

    getTwilioNumber(country: string): string {
        return this.getTwilioNumbers()[country];
    }

    getShortCodes(): ShortCode {
        return ShortCodeTypes;
    }


}