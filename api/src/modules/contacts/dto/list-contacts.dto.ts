import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { LeadStatus, SourceType } from '@/generated/prisma';
import {
    ContactProfileField,
    CONTACT_PROFILE_FIELD_KEYS,
} from '../constants/contact-profile-fields.constants';
import {
    ContactScoreRuleItemDto,
    ScoreRulesQueryTransform,
} from '@/modules/scoring-instructions/dto/contact-score-rule.dto';

export class ListContactsDto {
    @ApiPropertyOptional({ enum: LeadStatus })
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;

    @ApiPropertyOptional({
        type: [String],
        description: 'Filter by tag (repeat param or comma-separated)',
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(',').map((t) => t.trim()).filter(Boolean);
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

    @ApiPropertyOptional({ description: 'Search across linked Lead name/email/company' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Restrict to contacts that came from this filter' })
    @IsOptional()
    @IsString()
    filter_uuid?: string;

    @ApiPropertyOptional({ description: 'Restrict to contacts pointing at this lead' })
    @IsOptional()
    @IsString()
    lead_uuid?: string;

    @ApiPropertyOptional({ enum: SourceType })
    @IsOptional()
    @IsEnum(SourceType)
    source_type?: SourceType;

    @ApiPropertyOptional({
        enum: CONTACT_PROFILE_FIELD_KEYS,
        description:
            'Contact profile field to filter by (email, phone, website, linkedin_url, google_maps_url)',
    })
    @IsOptional()
    @IsIn(CONTACT_PROFILE_FIELD_KEYS)
    profile_field?: ContactProfileField;

    @ApiPropertyOptional({
        description:
            'When profile_field is set: true = contact must have a value, false = contact must not',
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    has_profile_field?: boolean;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
