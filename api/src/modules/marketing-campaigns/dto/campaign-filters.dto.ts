import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { LeadStatus } from '@/generated/prisma';
import {
    CampaignProfileField,
    CAMPAIGN_PROFILE_FIELD_KEYS,
} from '../constants/campaign-profile-fields.constants';
import {
    ContactScoreRuleItemDto,
    ScoreRulesQueryTransform,
} from '@/modules/scoring-instructions/dto/contact-score-rule.dto';
import { QueryBooleanTransform } from '@/shared/transforms/query-boolean.transform';

export class CampaignFiltersDto {
    @ApiPropertyOptional({ enum: LeadStatus })
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string')
            return value.split(',').map((t) => t.trim()).filter(Boolean);
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'JSON array of { scoring_instruction_uuid, min } (AND)',
    })
    @IsOptional()
    @ScoreRulesQueryTransform
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactScoreRuleItemDto)
    score_rules?: ContactScoreRuleItemDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description:
            'Restrict to contacts linked to this filter (via contact_filters; primary or also-found-by)',
    })
    @IsOptional()
    @IsUUID()
    filter_uuid?: string;

    @ApiPropertyOptional({ description: 'Only contacts that are members of this contact list' })
    @IsOptional()
    @IsUUID()
    contact_list_uuid?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    lead_uuid?: string;

    @ApiPropertyOptional({ description: 'Only contacts with an email address' })
    @IsOptional()
    @QueryBooleanTransform
    @IsBoolean()
    has_email?: boolean;

    @ApiPropertyOptional({ description: 'Only contacts with a phone number' })
    @IsOptional()
    @QueryBooleanTransform
    @IsBoolean()
    has_phone?: boolean;

    @ApiPropertyOptional({
        enum: CAMPAIGN_PROFILE_FIELD_KEYS,
        description:
            'Contact profile field to filter by (email, phone, website, linkedin_url, google_maps_url)',
    })
    @IsOptional()
    @IsIn(CAMPAIGN_PROFILE_FIELD_KEYS)
    profile_field?: CampaignProfileField;

    @ApiPropertyOptional({
        description:
            'When profile_field is set: true = contact must have a value, false = contact must not',
    })
    @IsOptional()
    @QueryBooleanTransform
    @IsBoolean()
    has_profile_field?: boolean;

    @ApiPropertyOptional({ description: 'ISO date — last_interaction_at after this' })
    @IsOptional()
    @IsDateString()
    last_interaction_after?: string;

    @ApiPropertyOptional({ description: 'ISO date — last_interaction_at before this' })
    @IsOptional()
    @IsDateString()
    last_interaction_before?: string;

    @ApiPropertyOptional({ description: 'Contact uuids to exclude from the resolved set' })
    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    exclude_uuids?: string[];

    @ApiPropertyOptional({ description: 'Include contacts who have unsubscribed (default false)' })
    @IsOptional()
    @QueryBooleanTransform
    @IsBoolean()
    include_unsubscribed?: boolean;

    @ApiPropertyOptional({ description: 'Only contacts who have never been sent an email or SMS campaign message' })
    @IsOptional()
    @QueryBooleanTransform
    @IsBoolean()
    never_contacted?: boolean;
}
