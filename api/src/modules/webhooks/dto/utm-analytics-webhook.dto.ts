import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

export const UtmAnalyticsDestinations = ['website', 'booking'] as const;
export type UtmAnalyticsDestination = (typeof UtmAnalyticsDestinations)[number];

export class UtmAnalyticsWebhookDto {
    @ApiPropertyOptional({ description: 'Marketing campaign uuid when known' })
    @IsOptional()
    @IsUUID()
    campaign_uuid?: string;

    @ApiProperty({ enum: UtmAnalyticsDestinations })
    @IsIn(UtmAnalyticsDestinations)
    destination!: UtmAnalyticsDestination;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    utm_source?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    utm_medium?: string;

    @ApiPropertyOptional({ description: 'Often set to the campaign uuid for direct matching' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    utm_campaign?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    utm_term?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    utm_content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    contact_uuid?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(2000)
    url?: string;
}
