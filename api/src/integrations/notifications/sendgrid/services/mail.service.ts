import { Injectable, Logger } from "@nestjs/common";
import { SendGridAdapter } from "../sendgrid/sendgrid.adapter";
import { CreateContact, CreateEmail } from "../interfaces/mail.interfaces";

@Injectable()
export class SendgridMailService {

    private readonly logger = new Logger(SendgridMailService.name);

    constructor(
        private sendgridAdapter: SendGridAdapter,
    ) {
    }

    public async sendEmail(create_email: CreateEmail) {

        try {
            return await this.sendgridAdapter.sendEmail(create_email);
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }

    public async sendBulkEmails(create_emails: CreateEmail[]) {
        try {
            const promises = create_emails.map(async (create_email) => {
                return await this.sendEmail(create_email);
            });
            return await Promise.all(promises);
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }


}