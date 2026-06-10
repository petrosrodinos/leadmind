import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

class UpdateCompletionValueDto {
    @IsUUID()
    field_uuid: string;

    @IsString()
    value: string;
}

export class UpdateFormCompletionDto {
    @ApiProperty({ type: [UpdateCompletionValueDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCompletionValueDto)
    values: UpdateCompletionValueDto[];
}
