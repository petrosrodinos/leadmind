import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateIntegrationKeyDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(4096)
    secret!: string;
}
