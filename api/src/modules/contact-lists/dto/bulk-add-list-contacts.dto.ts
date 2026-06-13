import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CampaignFiltersDto } from '@/modules/marketing-campaigns/dto/campaign-filters.dto';

export class BulkAddListContactsDto {
    @ApiProperty({ type: CampaignFiltersDto })
    @ValidateNested()
    @Type(() => CampaignFiltersDto)
    filters: CampaignFiltersDto;
}
