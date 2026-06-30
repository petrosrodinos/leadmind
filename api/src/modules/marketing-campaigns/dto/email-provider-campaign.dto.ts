import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { EmailProviderAllocationDto } from '@/modules/outreach/dto/email-provider.dto';

export class StartCampaignDto {
    @ApiPropertyOptional({ type: [EmailProviderAllocationDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmailProviderAllocationDto)
    email_provider_allocations?: EmailProviderAllocationDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    sender_profile_uuid?: string;
}

export class SendCampaignDraftsDto {
    @ApiPropertyOptional({ type: [EmailProviderAllocationDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EmailProviderAllocationDto)
    email_provider_allocations?: EmailProviderAllocationDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    sender_profile_uuid?: string;
}
