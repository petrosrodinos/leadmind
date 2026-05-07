import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMessageDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    content?: string;
}
