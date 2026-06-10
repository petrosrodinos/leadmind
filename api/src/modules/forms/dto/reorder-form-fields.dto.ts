import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ReorderItemDto {
    @IsUUID()
    uuid: string;

    @IsInt()
    @Min(0)
    order_index: number;
}

export class ReorderFormFieldsDto {
    @ApiProperty({ type: [ReorderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    fields: ReorderItemDto[];
}
