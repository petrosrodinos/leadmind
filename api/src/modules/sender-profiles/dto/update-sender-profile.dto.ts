import { PartialType } from '@nestjs/swagger';
import { CreateSenderProfileDto } from './create-sender-profile.dto';

export class UpdateSenderProfileDto extends PartialType(CreateSenderProfileDto) { }
