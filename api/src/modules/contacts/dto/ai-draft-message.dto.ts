import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OUTREACH_LANGUAGES, OutreachLanguage } from '../constants/outreach-languages';

export class AiDraftMessageDto {
    @ApiProperty()
    @IsUUID()
    contact_uuid!: string;

    @ApiProperty({ enum: [Channel.EMAIL, Channel.SMS] })
    @IsIn([Channel.EMAIL, Channel.SMS])
    channel!: Channel;

    @ApiProperty({ minLength: 1, maxLength: 2000 })
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    prompt!: string;

    @ApiPropertyOptional({ enum: OUTREACH_LANGUAGES })
    @IsOptional()
    @IsIn(OUTREACH_LANGUAGES)
    language?: OutreachLanguage;
}
