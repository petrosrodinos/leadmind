import { ApiPropertyOptional } from '@nestjs/swagger';
import { AiUsageOperation, AiUsageStatus } from '@/generated/prisma';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAiUsageDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    provider?: string;

    @ApiPropertyOptional({ enum: AiUsageOperation })
    @IsOptional()
    @IsEnum(AiUsageOperation)
    operation?: AiUsageOperation;

    @ApiPropertyOptional({ enum: AiUsageStatus })
    @IsOptional()
    @IsEnum(AiUsageStatus)
    status?: AiUsageStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;
}

export class AiUsageSummaryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;
}
