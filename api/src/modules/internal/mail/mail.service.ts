import { SendgridMailService } from '@/integrations/notifications/sendgrid/services/mail.service';
import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {

  constructor(
    private readonly mailService: SendgridMailService
  ) { }

  create(createMailDto: CreateMailDto) {
    return this.mailService.sendEmail(createMailDto);
  }




}
