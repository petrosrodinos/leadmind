import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString, MaxLength } from 'class-validator';

export class UpdateTagsDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    @ArrayUnique()
    tags: string[];
}
