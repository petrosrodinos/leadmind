import { Injectable, Logger } from "@nestjs/common";
import { CreateCall } from "../interfaces/calls.interfaces";
import { TwillioConfig } from "../config/twilio.config";
import { CallsUtils } from "../utils/calls.utils";

@Injectable()
export class CallsService {

    private twillioNumbers: { [key: string]: string } = {};
    private twillioClient: any;


    constructor(
        private twillioConfig: TwillioConfig,
        private logger: Logger
    ) {
        this.twillioClient = this.twillioConfig.getTwillioClient();
        this.twillioNumbers = this.twillioConfig.getTwilioNumbers();
    }

    async makeCall(create_call: CreateCall) {
        try {

            const callParams: any = {
                to: create_call.to,
                from: create_call.from || this.twillioNumbers['US'],
                statusCallback: create_call.statusCallback,
                statusCallbackMethod: create_call.statusCallbackMethod,
                statusCallbackEvent: create_call.statusCallbackEvent,
            };

            let twiml = '';

            if (create_call.message) {
                twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${CallsUtils.escapeXml(create_call.message)}</Say></Response>`;
                callParams.twiml = twiml;
            } else if (create_call.url) {
                twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Play>${create_call.url}</Play></Response>`;
                callParams.twiml = twiml;
            }

            const call = await this.twillioClient.calls.create(callParams);

            return call;
        } catch (error) {
            this.logger.error(`Error making call: ${error.message}`);
            throw error;
        }
    }


    async getCall(call_sid: string) {
        try {
            const call = await this.twillioClient.calls(call_sid).fetch();
            return call;
        } catch (error) {
            this.logger.error(`Error getting call: ${error.message}`);
            throw error
        }
    }

    async handleWebhook(webhookData: any) {
        try {
            const callSid = webhookData.CallSid;
            const callStatus = webhookData.CallStatus;
            const callDirection = webhookData.Direction;
            const recordingStatus = webhookData.RecordingStatus;

            const webhookEvent = {
                call_sid: callSid,
                call_status: callStatus,
                direction: callDirection,
                recording_status: recordingStatus,
            };

            console.log(webhookEvent);

            return webhookEvent;
        } catch (error) {
            this.logger.error(`Error handling Twilio webhook: ${error.message}`);
            throw error;
        }
    }

}
