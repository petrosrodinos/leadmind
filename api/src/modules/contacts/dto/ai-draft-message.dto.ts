import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { OUTREACH_LANGUAGES, OutreachLanguage } from '../constants/outreach-languages';
import { CAMPAIGN_AI_ACTIONS, CampaignAiAction } from '@/modules/marketing-campaigns/dto/generate-campaign-message.dto';

export class AiDraftMessageDto {
    @ApiProperty()
    @IsUUID()
    contact_uuid!: string;

    @ApiProperty({ enum: [Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL] })
    @IsIn([Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL])
    channel!: Channel;

    @ApiPropertyOptional({ enum: CAMPAIGN_AI_ACTIONS, default: 'generate' })
    @IsOptional()
    @IsIn(CAMPAIGN_AI_ACTIONS)
    action?: CampaignAiAction;

    @ApiPropertyOptional({ minLength: 1, maxLength: 2000 })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    prompt?: string;

    @ApiPropertyOptional({ enum: OUTREACH_LANGUAGES })
    @IsOptional()
    @IsIn(OUTREACH_LANGUAGES)
    language?: OutreachLanguage;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    current_subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    current_content?: string;
}
