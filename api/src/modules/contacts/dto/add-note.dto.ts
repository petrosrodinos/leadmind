import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddNoteDto {
    @ApiProperty({ minLength: 1, maxLength: 5000 })
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    content: string;
}
