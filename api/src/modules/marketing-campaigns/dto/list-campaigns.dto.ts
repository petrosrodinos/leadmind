import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CampaignStatus } from '@/generated/prisma';

export class ListCampaignsDto {
    @ApiPropertyOptional({ enum: CampaignStatus })
    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        type: [String],
        description: 'Filter by tags in filters_snapshot (comma-separated or repeated)',
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
