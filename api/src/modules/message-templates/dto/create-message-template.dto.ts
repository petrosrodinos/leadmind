import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const TEMPLATE_CHANNELS = [Channel.EMAIL, Channel.SMS] as const;

export class CreateMessageTemplateDto {
    @ApiProperty({ minLength: 1, maxLength: 200 })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    name!: string;

    @ApiProperty({ enum: TEMPLATE_CHANNELS, isArray: true })
    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(TEMPLATE_CHANNELS, { each: true })
    channels!: Channel[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    email_subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email_content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sms_content?: string;
}
