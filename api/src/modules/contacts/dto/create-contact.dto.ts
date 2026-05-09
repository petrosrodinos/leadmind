import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsEmail,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';

export class CreateContactDto {
    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    @MaxLength(320)
    email?: string;

    @ApiPropertyOptional({ maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    company?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(500)
    website?: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    location?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl({ require_protocol: false })
    @MaxLength(500)
    linkedin_url?: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    industry?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayUnique()
    tags?: string[];

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    notes?: string;
}
