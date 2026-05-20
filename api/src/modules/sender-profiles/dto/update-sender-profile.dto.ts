import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateSenderProfileDto } from './create-sender-profile.dto';
import { UtmParamsDto } from './utm-params.dto';

export class UpdateSenderProfileDto extends PartialType(CreateSenderProfileDto) {
    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => UtmParamsDto)
    website_utm?: UtmParamsDto | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => UtmParamsDto)
    booking_utm?: UtmParamsDto | null;
}
