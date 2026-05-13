import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { LeadStatus } from '@/generated/prisma';

/**
 * Shape stored in MarketingCampaign.filters_snapshot.
 * Mirrors ListContactsDto + campaign-specific extras (channel eligibility, exclusions,
 * last-interaction window, unsubscribe inclusion).
 */
export class CampaignFiltersDto {
    @ApiPropertyOptional({ enum: LeadStatus })
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string')
            return value.split(',').map((t) => t.trim()).filter(Boolean);
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ minimum: 1, maximum: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    min_score?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    filter_uuid?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    lead_uuid?: string;

    @ApiPropertyOptional({ description: 'Only contacts with an email address' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    has_email?: boolean;

    @ApiPropertyOptional({ description: 'Only contacts with a phone number' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    has_phone?: boolean;

    @ApiPropertyOptional({ description: 'ISO date — last_interaction_at after this' })
    @IsOptional()
    @IsDateString()
    last_interaction_after?: string;

    @ApiPropertyOptional({ description: 'ISO date — last_interaction_at before this' })
    @IsOptional()
    @IsDateString()
    last_interaction_before?: string;

    @ApiPropertyOptional({ description: 'Contact uuids to exclude from the resolved set' })
    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    exclude_uuids?: string[];

    @ApiPropertyOptional({ description: 'Include contacts who have unsubscribed (default false)' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    include_unsubscribed?: boolean;

    @ApiPropertyOptional({ description: 'Only contacts who have never been sent an email or SMS campaign message' })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    never_contacted?: boolean;
}
