import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsString, Min, MinLength, ValidateNested } from 'class-validator';

export class CreateSequenceStepDto {
    @ApiProperty({ minimum: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    delayHours: number;

    @ApiProperty({ enum: Channel })
    @IsEnum(Channel)
    channel: Channel;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    template: string;
}

export class CreateSequenceDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    name: string;

    @ApiProperty({ type: [CreateSequenceStepDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSequenceStepDto)
    steps: CreateSequenceStepDto[];
}
