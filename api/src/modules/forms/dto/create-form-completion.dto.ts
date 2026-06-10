import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

class CompletionValueDto {
    @IsUUID()
    field_uuid: string;

    @IsString()
    value: string;
}

export class CreateFormCompletionDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    contact_uuid: string;

    @ApiProperty({ type: [CompletionValueDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CompletionValueDto)
    values: CompletionValueDto[];
}
