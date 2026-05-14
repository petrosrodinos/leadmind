import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class ContactScoreRuleItemDto {
    @ApiProperty()
    @IsUUID()
    scoring_instruction_uuid: string;

    @ApiProperty({ minimum: 1, maximum: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    min: number;
}

export function parseScoreRulesQuery(value: unknown): ContactScoreRuleItemDto[] | undefined {
    if (value == null || value === '') return undefined;
    if (typeof value !== 'string') return undefined;
    try {
        const parsed = JSON.parse(value) as unknown;
        if (!Array.isArray(parsed)) return undefined;
        return parsed as ContactScoreRuleItemDto[];
    } catch {
        return undefined;
    }
}

export const ScoreRulesQueryTransform = Transform(({ value }) => parseScoreRulesQuery(value));
