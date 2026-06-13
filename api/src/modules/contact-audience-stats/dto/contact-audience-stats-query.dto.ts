import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CampaignFiltersDto } from '@/modules/marketing-campaigns/dto/campaign-filters.dto';

export class ContactAudienceStatsQueryDto extends CampaignFiltersDto {
    @ApiPropertyOptional({ description: 'ISO date — interaction stats from this date' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'ISO date — interaction stats until this date' })
    @IsOptional()
    @IsDateString()
    to?: string;
}
