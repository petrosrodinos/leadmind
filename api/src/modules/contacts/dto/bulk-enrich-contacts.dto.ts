import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { EnrichContactDto } from './enrich-contact.dto';

export class BulkEnrichContactsDto extends EnrichContactDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    uuids: string[];
}
