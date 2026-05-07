import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendOutreachDto {
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

    @ApiProperty()
    @IsUUID()
    contact_uuid: string;

    @ApiPropertyOptional({ description: 'ISO datetime for delayed sending' })
    @IsOptional()
    @IsDateString()
    scheduled_at?: string;
}
