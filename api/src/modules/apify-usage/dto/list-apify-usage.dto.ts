import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApifyUsageOperation, ApifyUsageStatus } from '@/generated/prisma';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListApifyUsageDto {
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
    actor_id?: string;

    @ApiPropertyOptional({ enum: ApifyUsageOperation })
    @IsOptional()
    @IsEnum(ApifyUsageOperation)
    operation?: ApifyUsageOperation;

    @ApiPropertyOptional({ enum: ApifyUsageStatus })
    @IsOptional()
    @IsEnum(ApifyUsageStatus)
    status?: ApifyUsageStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;
}

export class ApifyUsageSummaryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: string;
}
