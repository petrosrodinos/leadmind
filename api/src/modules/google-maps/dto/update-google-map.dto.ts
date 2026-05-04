import { PartialType } from '@nestjs/swagger';
import { CreateGoogleMapDto } from './create-google-map.dto';

export class UpdateGoogleMapDto extends PartialType(CreateGoogleMapDto) {}
