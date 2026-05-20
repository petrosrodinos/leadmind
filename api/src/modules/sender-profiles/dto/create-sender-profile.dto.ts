import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { UtmParamsDto } from './utm-params.dto';

export class CreateSenderProfileDto {
    @ApiProperty({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    name!: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    company_name?: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    first_name?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    last_name?: string;

    @ApiPropertyOptional({ maxLength: 320 })
    @IsOptional()
    @IsEmail()
    @MaxLength(320)
    email?: string;

    @ApiPropertyOptional({ maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(500)
    website?: string;

    @ApiPropertyOptional({
        description: 'Optional UTM query params appended to website links in outreach.',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => UtmParamsDto)
    website_utm?: UtmParamsDto;

    @ApiPropertyOptional({ maxLength: 300 })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    address?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    city?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    country?: string;

    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(500)
    logo_url?: string;

    @ApiPropertyOptional({
        maxLength: 500,
        description: 'Public booking / call scheduling URL (e.g. Calendly link) shown to recipients.',
    })
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(500)
    booking_url?: string;

    @ApiPropertyOptional({
        description: 'Optional UTM query params appended to booking links in outreach.',
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => UtmParamsDto)
    booking_utm?: UtmParamsDto;

    @ApiPropertyOptional({
        maxLength: 11,
        description: 'SMS alphanumeric sender ID — letters, digits and spaces, up to 11 chars.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(11)
    @Matches(/^[A-Za-z0-9 ]+$/, {
        message: 'sender_id must be alphanumeric (letters, digits, spaces).',
    })
    sender_id?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    signature?: string;

    @ApiPropertyOptional({
        maxLength: 5000,
        description:
            'Free-text description of the company and services offered. Used as context by the AI when generating email/SMS outreach so drafts can reference what the sender provides.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    business_description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    is_default?: boolean;
}
