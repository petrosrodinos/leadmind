
import { Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';

@Injectable()
export class SmsService {

  constructor(
    private readonly smsService: TwillioSmsService
  ) { }

  create(createSmDto: CreateSmDto) {
    try {
      return this.smsService.sendSms(createSmDto);
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }

  update(id: number, updateSmDto: UpdateSmDto) {
    return `This action updates a #${id} sm`;
  }

  remove(id: number) {
    return `This action removes a #${id} sm`;
  }
}
