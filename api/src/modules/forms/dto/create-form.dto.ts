import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFormDto {
    @ApiProperty({ maxLength: 200 })
    @IsString()
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional({ maxLength: 2000 })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;
}
