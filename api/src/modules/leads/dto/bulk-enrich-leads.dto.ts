import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { EnrichLeadDto } from './enrich-lead.dto';

export class BulkEnrichLeadsDto extends EnrichLeadDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    uuids: string[];
}
