import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { EmailProviderAllocationDto } from '@/modules/outreach/dto/email-provider.dto';

export class StartCampaignDto {
    @ApiPropertyOptional({ type: [EmailProviderAllocationDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmailProviderAllocationDto)
    email_provider_allocations?: EmailProviderAllocationDto[];
}

export class SendCampaignDraftsDto {
    @ApiPropertyOptional({ type: [EmailProviderAllocationDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmailProviderAllocationDto)
    email_provider_allocations?: EmailProviderAllocationDto[];
}
