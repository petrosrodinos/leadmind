import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkRemoveListContactsDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    contact_uuids: string[];
}
