import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CampaignContactStatus, Channel } from '@/generated/prisma';

export class ListCampaignContactsDto {
    @ApiPropertyOptional({ enum: CampaignContactStatus })
    @IsOptional()
    @IsEnum(CampaignContactStatus)
    status?: CampaignContactStatus;

    @ApiPropertyOptional({ enum: Channel })
    @IsOptional()
    @IsEnum(Channel)
    channel?: Channel;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 200 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number = 20;
}
