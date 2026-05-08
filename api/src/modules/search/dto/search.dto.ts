import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { LeadStatus, SourceType } from '@/generated/prisma';

export class SearchDto {
    @ApiPropertyOptional({ description: 'Full-text query' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ enum: LeadStatus, description: 'Contacts only' })
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;

    @ApiPropertyOptional({ minimum: 1, maximum: 10, description: 'Contacts only' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    min_score?: number;

    @ApiPropertyOptional({ enum: SourceType })
    @IsOptional()
    @IsEnum(SourceType)
    source_type?: SourceType;

    @ApiPropertyOptional({
        type: [String],
        description: 'Comma-separated tags (contacts only)',
    })
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
