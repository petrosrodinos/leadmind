import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Channel } from '@/generated/prisma';
import {
    CAMPAIGN_AI_ACTIONS,
    CampaignAiAction,
} from '@/modules/marketing-campaigns/dto/generate-campaign-message.dto';

const TEMPLATE_AI_CHANNELS = [Channel.EMAIL, Channel.SMS] as const;

export class GenerateTemplateMessageDto {
    @ApiProperty({ enum: TEMPLATE_AI_CHANNELS })
    @IsIn(TEMPLATE_AI_CHANNELS)
    channel!: Channel;

    @ApiProperty({ enum: CAMPAIGN_AI_ACTIONS })
    @IsEnum(CAMPAIGN_AI_ACTIONS)
    action!: CampaignAiAction;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    prompt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(40)
    language?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    current_subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    current_content?: string;
}
