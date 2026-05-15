import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OpenAiBatchJobType, OpenAiBatchStatus } from '@/generated/prisma';

export class ListBatchJobsDto {
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

    @ApiPropertyOptional({ enum: OpenAiBatchJobType })
    @IsOptional()
    @IsEnum(OpenAiBatchJobType)
    type?: OpenAiBatchJobType;

    @ApiPropertyOptional({ enum: OpenAiBatchStatus })
    @IsOptional()
    @IsEnum(OpenAiBatchStatus)
    status?: OpenAiBatchStatus;
}
