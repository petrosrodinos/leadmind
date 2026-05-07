import { SendgridMailService } from '@/integrations/notifications/sendgrid/services/mail.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateMailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {

  constructor(
    private readonly configService: ConfigService,
    private readonly sendgridMailService: SendgridMailService,
    private readonly resendMailService: ResendMailService,
  ) { }

  create(createMailDto: CreateMailDto) {
    const mailProvider = this.configService.get<string>('MAIL_PROVIDER') || 'resend';
    if (mailProvider === 'sendgrid') {
      return this.sendgridMailService.sendEmail(createMailDto);
    }

    return this.resendMailService.sendEmail(createMailDto);
  }




}
