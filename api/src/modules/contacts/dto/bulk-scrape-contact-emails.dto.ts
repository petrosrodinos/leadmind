import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { ListContactsDto } from './list-contacts.dto';

export class BulkScrapeContactEmailsFiltersDto extends ListContactsDto {}

export class BulkScrapeContactEmailsDto {
    @ApiPropertyOptional({ type: [String], description: 'Explicit contact UUIDs to scrape' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    contact_uuids?: string[];

    @ApiPropertyOptional({ description: 'Scrape all members of this list when contact_uuids omitted' })
    @IsOptional()
    @IsUUID('4')
    list_uuid?: string;

    @ApiPropertyOptional({
        type: BulkScrapeContactEmailsFiltersDto,
        description: 'Filter contacts when contact_uuids and list_uuid are omitted',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => BulkScrapeContactEmailsFiltersDto)
    filters?: BulkScrapeContactEmailsFiltersDto;
}
