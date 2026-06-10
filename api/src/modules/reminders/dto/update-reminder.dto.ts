import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReminderStatus } from '@/generated/prisma';

export class UpdateReminderDto {
    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    notes?: string;

    @ApiPropertyOptional({ description: 'ISO 8601 datetime string' })
    @IsOptional()
    @IsDateString()
    remind_at?: string;

    @ApiPropertyOptional({ enum: ReminderStatus })
    @IsOptional()
    @IsEnum(ReminderStatus)
    status?: ReminderStatus;
}
