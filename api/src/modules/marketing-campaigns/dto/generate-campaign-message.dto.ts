import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Channel } from '@/generated/prisma';

export const CAMPAIGN_AI_ACTIONS = [
    'generate',
    'improve',
    'shorten',
    'tone_professional',
    'tone_friendly',
    'tone_direct',
    'personalize',
] as const;
export type CampaignAiAction = (typeof CAMPAIGN_AI_ACTIONS)[number];

export class GenerateCampaignMessageDto {
    @ApiProperty({ enum: Channel })
    @IsEnum(Channel)
    channel: Channel;

    @ApiProperty({ enum: CAMPAIGN_AI_ACTIONS })
    @IsEnum(CAMPAIGN_AI_ACTIONS)
    action: CampaignAiAction;

    @ApiPropertyOptional({ description: 'User prompt / what the campaign should say' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    prompt?: string;

    @ApiPropertyOptional({ description: 'Language for the output (e.g. English, Greek)' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    language?: string;

    @ApiPropertyOptional({ description: 'Existing subject (for improve/tone actions)' })
    @IsOptional()
    @IsString()
    current_subject?: string;

    @ApiPropertyOptional({ description: 'Existing content (for improve/shorten/tone actions)' })
    @IsOptional()
    @IsString()
    current_content?: string;

    @ApiPropertyOptional({ description: 'Sample contact uuid for personalize/preview' })
    @IsOptional()
    @IsUUID()
    sample_contact_uuid?: string;
}
