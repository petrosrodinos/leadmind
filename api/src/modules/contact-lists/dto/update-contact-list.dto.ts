import { PartialType } from '@nestjs/swagger';
import { CreateContactListDto } from './create-contact-list.dto';

export class UpdateContactListDto extends PartialType(CreateContactListDto) {}
