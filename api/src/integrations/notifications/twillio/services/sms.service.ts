import { Injectable } from "@nestjs/common";
import { CreateSms, ShortCode } from "../interfaces/sms.interfaces";
import { TwillioConfig } from "../config/twilio.config";

@Injectable()
export class TwillioSmsService {
    private twillioClient: any;
    private shortCodes: ShortCode;


    constructor(
        private twillioConfig: TwillioConfig

    ) {
        this.twillioClient = this.twillioConfig.getTwillioClient();
        this.shortCodes = this.twillioConfig.getShortCodes();

    }

    public async sendSms(create_sms: CreateSms) {

        try {
            const shortcode = (create_sms.from || this.shortCodes.appointly).substring(0, 10);
            const msg = {
                to: create_sms.to,
                from: shortcode,
                body: create_sms.body,
            }
            return await this.twillioClient.messages.create(msg);
        } catch (error) {
            throw new Error(error);
        }
    }

    public async sendBulkSms(create_sms: CreateSms[]) {
        try {
            const promises = create_sms.map(async (create_sms) => {
                return await this.sendSms(create_sms);
            });
            return await Promise.all(promises);
        } catch (error) {
            throw new Error(error);
        }
    }

}
