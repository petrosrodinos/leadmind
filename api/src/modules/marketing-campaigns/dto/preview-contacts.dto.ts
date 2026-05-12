import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CampaignFiltersDto } from './campaign-filters.dto';

export class PreviewContactsDto {
    @ValidateNested()
    @Type(() => CampaignFiltersDto)
    filters: CampaignFiltersDto;
}
