import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    MaxLength,
} from 'class-validator';

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    is_default?: boolean;
}
