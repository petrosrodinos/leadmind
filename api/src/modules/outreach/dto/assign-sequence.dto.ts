import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignSequenceDto {
    @ApiProperty()
    @IsUUID()
    contact_uuid: string;
}
