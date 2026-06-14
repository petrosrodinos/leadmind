import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class BulkSendOutreachDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    contact_uuids: string[];

    @ApiProperty({ enum: Channel })
    @IsEnum(Channel)
    channel: Channel;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    content: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    subject?: string;
}
