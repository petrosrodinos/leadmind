import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';
import { OUTREACH_LANGUAGES, OutreachLanguage } from '../constants/outreach-languages';

export class BulkAiDraftMessagesDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID('4', { each: true })
    contact_uuids: string[];

    @ApiProperty({ enum: [Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL] })
    @IsIn([Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL])
    channel: Channel;

    @ApiProperty({ minLength: 1, maxLength: 2000 })
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    prompt: string;

    @ApiPropertyOptional({ enum: OUTREACH_LANGUAGES })
    @IsOptional()
    @IsIn(OUTREACH_LANGUAGES)
    language?: OutreachLanguage;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    send?: boolean;
}
