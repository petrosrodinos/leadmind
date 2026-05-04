import { Injectable, Logger } from "@nestjs/common";
import { SendGridAdapter } from "../sendgrid/sendgrid.adapter";
import { CreateContact } from "../interfaces/mail.interfaces";

@Injectable()
export class SendGridListService {

    private readonly logger = new Logger(SendGridListService.name);

    constructor(
        private sendgridAdapter: SendGridAdapter,
    ) {
    }


    public async createList(name: string) {
        try {
            return await this.sendgridAdapter.createList(name);
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }


    public async getLists(): Promise<any> {
        try {
            return await this.sendgridAdapter.getLists();
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }

    public async createContact(data: CreateContact) {
        try {
            return await this.sendgridAdapter.createContact(data);
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }


}