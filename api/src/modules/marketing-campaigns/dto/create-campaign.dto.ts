import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Channel, CampaignType } from '@/generated/prisma';
import { CampaignFiltersDto } from './campaign-filters.dto';

export class CreateCampaignDto {
    @ApiPropertyOptional({ enum: CampaignType, description: 'STANDARD (template) or PERSONALIZED (AI draft per contact)' })
    @IsOptional()
    @IsEnum(CampaignType)
    campaign_type?: CampaignType;

    @ApiProperty({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    name: string;

    @ApiPropertyOptional({ maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({ enum: Channel, isArray: true, description: 'Exactly one channel per campaign' })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1)
    @ArrayUnique()
    @IsEnum(Channel, { each: true })
    channels: Channel[];

    @ApiPropertyOptional({ description: 'Email subject (required when EMAIL ∈ channels)' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    email_subject?: string;

    @ApiPropertyOptional({ description: 'Email HTML body (required when EMAIL ∈ channels)' })
    @IsOptional()
    @IsString()
    email_content?: string;

    @ApiPropertyOptional({ description: 'SMS body (required when SMS ∈ channels)' })
    @IsOptional()
    @IsString()
    @MaxLength(1600)
    sms_content?: string;

    @ApiPropertyOptional({ description: 'Override sender profile (default: user is_default)' })
    @IsOptional()
    @IsUUID()
    sender_profile_uuid?: string;

    @ApiPropertyOptional({ description: 'ISO datetime; if in future, campaign is queued for that time' })
    @IsOptional()
    @IsDateString()
    scheduled_at?: string;

    @ApiPropertyOptional({ description: 'AI prompt for PERSONALIZED campaigns', maxLength: 2000 })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    ai_prompt?: string;

    @ApiPropertyOptional({ type: CampaignFiltersDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => CampaignFiltersDto)
    filters?: CampaignFiltersDto;
}
