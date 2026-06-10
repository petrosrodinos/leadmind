import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ReminderStatus } from '@/generated/prisma';

export class ListRemindersDto {
    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    contact_uuid?: string;

    @ApiPropertyOptional({ enum: ReminderStatus })
    @IsOptional()
    @IsEnum(ReminderStatus)
    status?: ReminderStatus;

    @ApiPropertyOptional({ enum: ['today', 'week', 'month', 'all', 'overdue'] })
    @IsOptional()
    @IsIn(['today', 'week', 'month', 'all', 'overdue'])
    range?: 'today' | 'week' | 'month' | 'all' | 'overdue';

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

    @ApiPropertyOptional({ description: 'Search by title, notes, or contact name/company/email' })
    @IsOptional()
    @IsString()
    search?: string;
}
